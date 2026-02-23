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

  //Verificación aceptando ser staff 
  REGISTRATION_ACCEPT: {
    subject: 'Has sido invitado a unirte a PayPac',
    requiredVariables: [
      'name',
      'last_name',
      'inviter_name',
      'inviter_last_name',
      'role',
      'email',
      'accept_link',
    ],
    html: (vars) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación PayPac</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, Helvetica, sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f0f2f5; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:520px; background-color:#ffffff; border-radius:14px;
                 box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- Header with logo -->
          <tr>
            <td style="background-color:#ffffff; padding: 24px 30px; text-align:center;">
              <img
                src="https://fabritek.co/paypac/logos/logo_paypac.png"
                alt="PayPac"
                width="200"
                style="display:inline-block; max-width:200px; height:auto;"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px 0; font-size:22px; color:#111827; font-weight:700;">
                👋 Hola, ${vars.name}
              </h2>

              <!-- Divider -->
              <div style="width:48px; height:4px; background-color:#0031FB; border-radius:2px; margin-bottom:24px;"></div>

              <!-- Invitation message -->
              <p style="margin:0 0 12px 0; font-size:15px; line-height:1.7; color:#374151;">
                <strong>${vars.inviter_name} ${vars.inviter_last_name}</strong> te ha invitado para que seas parte de su equipo en <strong>Paypac</strong>.
              </p>

              <!-- Role badge -->
              <p style="margin:0 0 20px 0; font-size:15px; line-height:1.7; color:#374151;">
                Se te ha asignado el rol de:
              </p>
              <div style="display:inline-block; margin-bottom:24px;">
                <span style="display:inline-block; background-color:#eff2ff; color:#0031FB;
                             font-size:13px; font-weight:700; letter-spacing:0.8px;
                             text-transform:uppercase; padding:6px 16px; border-radius:20px;
                             border:1px solid #c7d2fe;">
                  ${vars.role}
                </span>
              </div>

              <!-- Account info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#f8fafc; border-radius:8px; border:1px solid #e5e7eb;
                       margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 6px 0; font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.6px;">
                      Cuenta asignada
                    </p>
                    <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">
                      ${vars.email}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${vars.accept_link}"
                       target="_blank"
                       style="display:inline-block; background-color:#0031FB; color:#ffffff;
                              text-decoration:none; font-size:15px; font-weight:700;
                              padding:14px 40px; border-radius:8px; letter-spacing:0.3px;
                              mso-padding-alt:0; text-align:center;">
                      ✅ &nbsp;Aceptar invitación
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:20px 0 0 0; font-size:12px; color:#9ca3af; text-align:center; line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${vars.accept_link}" style="color:#0031FB; word-break:break-all;">
                  ${vars.accept_link}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e5e7eb;
                       padding:18px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                Si no esperabas esta invitación, puedes ignorar este correo de forma segura.<br/>
                © ${new Date().getFullYear()} PayPac. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

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