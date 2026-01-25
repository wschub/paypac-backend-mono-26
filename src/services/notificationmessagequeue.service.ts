import { NotificationMessageQueueRepository } from '../repositories/notificationmessagequeue.repository';
import { NotificationEmailTemplatesRepository } from '../repositories/notificationemailtemplates.repository';
import { BrevoService } from './brevo.service';
import { renderTemplate, validateTemplateVariables, wrapEmailHtml } from '../utils/template-renderer';
import { Prisma } from '@prisma/client';

const messageRepo = new NotificationMessageQueueRepository();
const templateRepo = new NotificationEmailTemplatesRepository();
const brevoService = new BrevoService();

export interface QueueEmailParams {
  user_id: number;
  email_delivery: string; // Email del destinatario
  template_code: string; // Código del template a usar
  variables: Record<string, string | number>; // Variables para reemplazar
  send_at?: Date; // Opcional: programar envío
}

export class NotificationMessageQueueService {
  /**
   * Encolar un nuevo mensaje para envío
   */
  async queueEmail(params: QueueEmailParams) {
    // 1. Obtener el template por código
    const template = await templateRepo.findByCode(params.template_code);
    if (!template) {
      throw new Error(`Template con código "${params.template_code}" no encontrado`);
    }

    // 2. Validar que todas las variables requeridas estén presentes
    const validation = validateTemplateVariables(
      template.template_variables,
      params.variables
    );

    if (!validation.valid) {
      throw new Error(
        `Faltan variables requeridas: ${validation.missing.join(', ')}`
      );
    }

    // 3. Renderizar el subject y el contenido HTML
    const renderedSubject = renderTemplate(template.template_subject, params.variables);
    
    // Aquí debes tener un campo en el template para el HTML content
    // Por ahora, asumimos que las variables se aplican al subject
    // TODO: Agregar campo html_content al modelo NotificationEmailTemplates
    const htmlContent = `
      <h1>${renderedSubject}</h1>
      <p>Este es un mensaje generado automáticamente.</p>
      <p>Variables recibidas:</p>
      <ul>
        ${Object.entries(params.variables)
          .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
          .join('')}
      </ul>
    `;

    const wrappedHtml = wrapEmailHtml(htmlContent);

    // 4. Crear el mensaje en la cola
    const message = await messageRepo.create({
  user_id: params.user_id,
  template_id: template.id,
  template_subject: renderedSubject,
  template_type: template.template_type,
  email_delivery: params.email_delivery,
  template_code: wrappedHtml, // ✅ aquí va el HTML
  send_at: params.send_at || null,
  status: 0,
});


    console.log('✅ Email encolado:', {
      id: message.id,
      to: params.email_delivery,
      template: params.template_code,
    });

    return message;
  }

  /**
   * Procesar mensajes pendientes
   * Este método lo llama el CRON job
   */
  async processPendingMessages() {
    const pendingMessages = await messageRepo.findPendingMessages();

    console.log(`📧 Procesando ${pendingMessages.length} mensaje(s) pendiente(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      total: pendingMessages.length,
    };

    for (const message of pendingMessages) {
      try {
        // Enviar el email usando Brevo
        const result = await brevoService.sendEmail({
          to: {
            email: message.email_delivery,
            name: message.user.name || 'Usuario',
          },
          subject: message.template_subject,
          htmlContent: message.template_code || '',

        });

        if (result.success) {
          // Actualizar status a ENVIADO (1)
          await messageRepo.updateStatus(
            message.id,
            1,
            `Email enviado exitosamente. MessageID: ${result.messageId}`
          );
          results.sent++;
        } else {
          // Actualizar status a FALLIDO (2)
          await messageRepo.updateStatus(
            message.id,
            2,
            `Error al enviar: ${result.error}`
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

    console.log('📊 Resumen de procesamiento:', results);
    return results;
  }

  /**
   * Obtener todos los mensajes de la cola
   */
  async getMessages(filters?: { 
    status?: number; 
    user_id?: number;
    template_id?: number;
  }) {
    return messageRepo.findAll(filters);
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
   * Obtener historial de mensajes de un usuario
   */
  async getUserMessages(userId: number) {
    return messageRepo.findByUserId(userId);
  }

  /**
   * Reintentar envío de un mensaje fallido
   * Solo PAYPAC puede hacer esto
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
      throw new Error('Solo se pueden reintentar mensajes fallidos (status = 2)');
    }

    // Actualizar status a pendiente
    await messageRepo.updateStatus(id, 0, 'Reintento manual solicitado');

    return {
      message: 'Mensaje marcado para reintento',
      id,
    };
  }

  /**
   * Eliminar mensaje
   * Solo PAYPAC puede eliminar
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
   * Obtener estadísticas de la cola
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
   * Solo PAYPAC puede ejecutar limpieza
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