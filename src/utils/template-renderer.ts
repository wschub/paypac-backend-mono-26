import * as brevo from '@getbrevo/brevo';
import { brevoApiInstance, brevoConfig } from '../config/brevo';

export interface SendEmailParams {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class BrevoService {
  /**
   * Enviar un email transaccional usando Brevo
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = params.subject;
      sendSmtpEmail.to = [params.to];
      sendSmtpEmail.htmlContent = params.htmlContent;
      sendSmtpEmail.sender = {
        name: brevoConfig.senderName,
        email: brevoConfig.senderEmail,
      };

      const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);

      // La respuesta de Brevo tiene esta estructura:
      // { response: IncomingMessage, body: CreateSmtpEmail }
      const messageId = result.body?.messageId || result.response?.headers?.['x-message-id'] || 'unknown';

      console.log('✅ Email enviado exitosamente:', {
        messageId,
        to: params.to.email,
        statusCode: result.response?.statusCode,
      });

      return {
        success: true,
        messageId: String(messageId),
      };
    } catch (error: any) {
      console.error('❌ Error al enviar email con Brevo:', error);

      return {
        success: false,
        error: error.message || 'Error desconocido al enviar email',
      };
    }
  }

  /**
   * Enviar múltiples emails (batch)
   * Útil para notificaciones masivas
   */
  async sendBatchEmails(emails: SendEmailParams[]): Promise<SendEmailResult[]> {
    const results: SendEmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);

      // Delay entre envíos para evitar rate limiting
      await this.delay(100);
    }

    return results;
  }

  /**
   * Validar configuración de Brevo
   */
  validateConfig(): void {
    if (!brevoConfig.apiKey) {
      throw new Error('BREVO_API_KEY no configurada');
    }
  }

  /**
   * Helper: delay en milisegundos
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}