import * as brevo from '@getbrevo/brevo';

/**
 * Configuración de Brevo API
 */
export const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'notifications@paypac.com.co',
  senderName: process.env.BREVO_SENDER_NAME || 'Paypac Notifications',
};

/**
 * Instancia configurada de Brevo API
 */
export const brevoApiInstance = new brevo.TransactionalEmailsApi();

brevoApiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  brevoConfig.apiKey
);

/**
 * Validar que la API key esté configurada
 */
export const validateBrevoConfig = (): void => {
  if (!brevoConfig.apiKey) {
    throw new Error(
      'BREVO_API_KEY no está configurada en las variables de entorno'
    );
  }

  if (!brevoConfig.senderEmail) {
    console.warn('⚠️ BREVO_SENDER_EMAIL no está configurado, usando valor por defecto');
  }

  console.log('✅ Brevo API configurada correctamente');
};