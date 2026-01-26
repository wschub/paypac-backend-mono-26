/**
 * Configuración de Onurix SMS API
 */
export const onurixConfig = {
  client: process.env.ONURIX_CLIENT || '',
  key: process.env.ONURIX_KEY || '',
  appName: process.env.ONURIX_APP_NAME || 'paypac',
  sendUrl: process.env.ONURIX_SEND_URL || 'https://www.onurix.com/api/v1/sms/2fa/send',
  verifyUrl: process.env.ONURIX_VERIFY_URL || 'https://www.onurix.com/api/v1/2fa/verification-code',
};

/**
 * Validar que las credenciales de Onurix estén configuradas
 */
export const validateOnurixConfig = (): void => {
  if (!onurixConfig.client) {
    throw new Error('ONURIX_CLIENT no está configurada en las variables de entorno');
  }

  if (!onurixConfig.key) {
    throw new Error('ONURIX_KEY no está configurada en las variables de entorno');
  }

  console.log('✅ Onurix SMS API configurada correctamente');
};