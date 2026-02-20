// src/templates/email-templates.ts

interface EmailTemplate {
  subject: string;
  html: (variables: Record<string, any>) => string;
  requiredVariables: string[];
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  // ✅ Verificación de email al registrarse
  REGISTRATION_VERIFY: {
    subject: 'Verifica tu cuenta en PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #6366f1; }
          .otp-code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 5px; margin: 30px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PayPac</div>
          </div>
          <h1 style="color: #333;">¡Bienvenido ${vars.user_name}!</h1>
          <p style="color: #666; font-size: 16px;">Gracias por registrarte en PayPac. Para completar tu registro, verifica tu email usando el siguiente código:</p>
          <div class="otp-code">${vars.otp_code}</div>
          <p style="color: #666; font-size: 14px;">Este código expira en <strong>5 minutos</strong>.</p>
          <p style="color: #999; font-size: 12px;">Si no solicitaste este código, puedes ignorar este mensaje.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PayPac. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  // ✅ Login con código OTP
  LOGIN_OTP: {
    subject: 'Tu código de acceso a PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; }
          .otp-code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 5px; margin: 30px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hola ${vars.user_name}</h1>
          <p>Tu código de acceso es:</p>
          <div class="otp-code">${vars.otp_code}</div>
          <p style="color: #666;">Válido por <strong>5 minutos</strong>.</p>
        </div>
      </body>
      </html>
    `,
  },

  // ✅ Resetear contraseña
  PASSWORD_RESET: {
    subject: 'Restablece tu contraseña de PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; }
          .otp-code { background: #f0f0f0; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 5px; margin: 30px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hola ${vars.user_name}</h1>
          <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <div class="otp-code">${vars.otp_code}</div>
          <p style="color: #666;">Este código expira en <strong>5 minutos</strong>.</p>
          <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
      </body>
      </html>
    `,
  },

  // ✅ Confirmación de compra de tickets
  TICKET_PURCHASE: {
    subject: '¡Tu compra fue exitosa! - {{event_name}}',
    requiredVariables: ['user_name', 'event_name', 'tickets_qty', 'total_amount'],
    html: (vars) => `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px; }
          .success-icon { text-align: center; font-size: 48px; margin-bottom: 20px; }
          .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>¡Gracias por tu compra, ${vars.user_name}!</h1>
          <p>Tu pago ha sido procesado exitosamente.</p>
          <div class="details">
            <p><strong>Evento:</strong> ${vars.event_name}</p>
            <p><strong>Cantidad de tickets:</strong> ${vars.tickets_qty}</p>
            <p><strong>Total:</strong> $${vars.total_amount}</p>
          </div>
          <p>Tus tickets están adjuntos en este correo.</p>
          <p style="color: #666; font-size: 12px;">¡Nos vemos en el evento!</p>
        </div>
      </body>
      </html>
    `,
  },
};

// ✅ Helper para renderizar subject con variables
export function renderSubject(subject: string, vars: Record<string, any>): string {
  return subject.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}