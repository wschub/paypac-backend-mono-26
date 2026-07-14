import { NotificationMessageQueueRepository } from '../repositories/notificationmessagequeue.repository';
import { BrevoService } from './brevo.service';
import { EMAIL_TEMPLATES } from '../templates/email-templates';
import { NotificationType } from '@prisma/client';
import { notificationGateService } from './notification_gate.service';

const messageRepo = new NotificationMessageQueueRepository();
const brevoService = new BrevoService();

export interface QueueEmailParams {
  userId: number;
  email: string;
  templateCode: string;
  variables: Record<string, any>;
  sendAt?: Date;
}

// Mapeo templateCode -> NotificationType, para el gate de preferencias.
// Solo se incluyen templates cuyo `userId` es el destinatario REAL de ese
// email (con cuenta en el sistema) — templates como
// TICKET_TRANSFER_RECEIVED_UNREGISTERED o NOTIFICATION_ASSIGNING_EVENT se
// dejan fuera a propósito: el primero manda a un contacto sin cuenta (el
// userId es solo referencia del remitente), el segundo es a STAFF, no
// CUSTOMER. Los templates de cuenta/registro (REGISTRATION_*) también
// quedan fuera — son transaccionales y siempre se envían.
const TEMPLATE_TO_TYPE: Partial<Record<string, NotificationType>> = {
  TICKET_PURCHASE: 'TICKET_PURCHASE_CONFIRMATION',
  TICKET_TRANSFER_RECEIVED: 'TICKET_TRANSFER',
  TICKET_TRANSFER_STATUS: 'TICKET_TRANSFER',
  WAITING_LIST_CONFIRM: 'EVENT_WAITING_LIST',
  RESALE_SOLD_SELLER: 'RESALE_TICKET_SOLD',
  RESALE_TICKET_BUYER: 'RESALE_TICKET_SOLD',
  RESALE_AVAILABLE: 'EVENT_TICKET_AVAILABLE',
};

// INVOICE_STATUS reutiliza el mismo templateCode para aprobado/rechazado/
// anulado — el tipo real depende del status que viaja en las variables.
function resolveNotificationType(
  templateCode: string,
  variables: Record<string, any>
): NotificationType | null {
  if (templateCode === 'INVOICE_STATUS') {
    return variables.status === 'APPROVED' ? 'TICKET_PURCHASE_CONFIRMATION' : 'TICKET_PURCHASE_FAILED';
  }
  return TEMPLATE_TO_TYPE[templateCode] ?? null;
}

export class NotificationMessageQueueService {
  /**
   * Encolar un nuevo mensaje para envío
   */
  async queueEmail(params: QueueEmailParams) {
    // 0. Gate por preferencias — solo bloquea si el template está mapeado
    //    y el usuario apagó explícitamente ese canal para ese tipo.
    const notificationType = resolveNotificationType(params.templateCode, params.variables);
    if (notificationType) {
      const allowed = await notificationGateService.shouldDeliver(params.userId, notificationType, 'email');
      if (!allowed) {
        console.log(`🔕 Email omitido por preferencias — user ${params.userId}, template ${params.templateCode}`);
        return { skipped: true, userId: params.userId, templateCode: params.templateCode };
      }
    }

    // 1. Obtener template estático
    const template = EMAIL_TEMPLATES[params.templateCode];
    if (!template) {
      throw new Error(`Template "${params.templateCode}" no encontrado`);
    }

    // 2. Validar variables requeridas
    const missingVars = template.requiredVariables.filter(
      v => !(v in params.variables)
    );
    if (missingVars.length > 0) {
      throw new Error(`Faltan variables: ${missingVars.join(', ')}`);
    }

    // 3. Renderizar subject y HTML
    const emailSubject = template.subject(params.variables);
    const emailBody = template.html(params.variables);

    // 4. Guardar en cola
    const message = await messageRepo.create({
      user_id: params.userId,
      template_code: params.templateCode,
      email_delivery: params.email,
      email_subject: emailSubject,
      email_body: emailBody,
      send_at: params.sendAt || null,
      status: 0,
    });

    console.log('✅ Email encolado:', {
      id: message.id,
      to: params.email,
      template: params.templateCode,
    });

    return message;
  }

  /**
   * Procesar mensajes pendientes (llamado por CRON)
   */
  async processPendingMessages() {
    const pendingMessages = await messageRepo.findPendingMessages();

    console.log(`📧 Procesando ${pendingMessages.length} mensaje(s) pendiente(s)...`);

    const results = { sent: 0, failed: 0, total: pendingMessages.length };

    for (const message of pendingMessages) {
      try {
        const result = await brevoService.sendEmail({
          to: {
            email: message.email_delivery,
            name: message.user.name || 'Usuario',
          },
          subject: message.email_subject,
          htmlContent: message.email_body,
        });

        if (result.success) {
          await messageRepo.updateStatus(
            message.id,
            1,
            `Enviado: ${result.messageId}`
          );
          results.sent++;
        } else {
          await messageRepo.updateStatus(
            message.id,
            2,
            `Error: ${result.error}`
          );
          results.failed++;
        }
      } catch (error: any) {
        console.error(`❌ Error procesando mensaje ${message.id}:`, error);
        await messageRepo.updateStatus(
          message.id,
          2,
          `Excepción: ${error.message}`
        );
        results.failed++;
      }
    }

    console.log('📊 Resumen:', results);
    return results;
  }

  /**
   * Obtener mensajes del usuario
   */
  async getUserMessages(userId: number) {
    return messageRepo.findByUserId(userId);
  }

  /**
   * Obtener mensaje por ID
   */
  async getMessageById(id: number) {
    const message = await messageRepo.findById(id);
    if (!message) {
      throw new Error('Mensaje no encontrado');
    }
    return message;
  }

  /**
   * Reintentar mensaje fallido
   */
  async retryMessage(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede reintentar mensajes');
    }

    const message = await messageRepo.findById(id);
    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (message.status !== 2) {
      throw new Error('Solo se pueden reintentar mensajes fallidos');
    }

    await messageRepo.updateStatus(id, 0, 'Reintento manual');
    return { message: 'Mensaje marcado para reintento', id };
  }

  /**
   * Eliminar mensaje
   */
  async deleteMessage(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar mensajes');
    }

    const message = await messageRepo.findById(id);
    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    return messageRepo.delete(id);
  }

  /**
   * Estadísticas de la cola
   */
  async getQueueStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const countsByStatus = await messageRepo.countByStatus();
    return {
      pending: countsByStatus[0] || 0,
      sent: countsByStatus[1] || 0,
      failed: countsByStatus[2] || 0,
      total: Object.values(countsByStatus).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Limpiar mensajes antiguos
   */
  async cleanOldMessages(daysOld: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede limpiar mensajes antiguos');
    }

    const deletedCount = await messageRepo.cleanOldMessages(daysOld);
    return {
      message: `Se eliminaron ${deletedCount} mensaje(s) antiguo(s)`,
      deleted: deletedCount,
    };
  }
}