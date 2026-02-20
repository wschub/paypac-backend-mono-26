import { NotificationMessageQueueRepository } from '../repositories/notificationmessagequeue.repository';
import { BrevoService } from './brevo.service';
import { EMAIL_TEMPLATES, renderSubject } from '../templates/email-templates';

const messageRepo = new NotificationMessageQueueRepository();
const brevoService = new BrevoService();

export interface QueueEmailParams {
  userId: number;
  email: string;
  templateCode: string;
  variables: Record<string, any>;
  sendAt?: Date;
}

export class NotificationMessageQueueService {
  /**
   * Encolar un nuevo mensaje para envío
   */
  async queueEmail(params: QueueEmailParams) {
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
    const emailSubject = renderSubject(template.subject, params.variables);
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