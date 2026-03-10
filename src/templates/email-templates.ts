// src/templates/email-templates.ts

interface EmailTemplate {
  subject: string;
  html: (variables: Record<string, any>) => string;
  requiredVariables: string[];
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  // ✅ Verificación de email al registrarse
  /*
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
  },*/

  REGISTRATION_VERIFY_MAIL_v1: {
  subject: 'Verifica tu cuenta en PayPac',
  requiredVariables: ['user_name', 'otp_code', 'verify_link'],
  html: (vars) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifica tu cuenta en PayPac</title>
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
                👋 Hola, ${vars.user_name}
              </h2>

              <!-- Divider -->
              <div style="width:48px; height:4px; background-color:#0031FB; border-radius:2px; margin-bottom:24px;"></div>

              <!-- Message -->
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#374151;">
                Gracias por registrarte en <strong>PayPac</strong>. Para completar tu registro,
                verifica tu email usando el siguiente código:
              </p>

              <!-- OTP Code -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block; background-color:#eff2ff;
                                border:2px dashed #0031FB; border-radius:12px;
                                padding:20px 40px;">
                      <span style="font-size:36px; font-weight:800; letter-spacing:10px;
                                   color:#0031FB; font-family: 'Courier New', monospace;">
                        ${vars.otp_code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#fff7ed; border-radius:8px; border:1px solid #fed7aa;
                       margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0; font-size:14px; color:#92400e; line-height:1.6;">
                      ⏱️ Este código expira en <strong>5 minutos</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security note -->
              <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6; text-align:center;">
                Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e5e7eb;
                       padding:18px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
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

REGISTRATION_VERIFY_MAIL: {
  subject: 'Verifica tu cuenta en PayPac',
  requiredVariables: ['user_name', 'otp_code', 'verify_link'],
  html: (vars) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifica tu cuenta en PayPac</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f0f2f5; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

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

              <h2 style="margin:0 0 8px 0; font-size:22px; color:#111827; font-weight:700;">
                Hola, ${vars.user_name}
              </h2>

              <div style="width:48px; height:4px; background-color:#0031FB; border-radius:2px; margin-bottom:24px;"></div>

              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#374151;">
                Gracias por registrarte en <strong>PayPac</strong>. Para completar tu registro,
                verifica tu email usando el siguiente código:
              </p>

              <!-- OTP Code -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block; background-color:#eff2ff;
                                border:2px dashed #0031FB; border-radius:12px;
                                padding:20px 40px;">
                      <span style="font-size:36px; font-weight:800; letter-spacing:10px;
                                   color:#0031FB; font-family: 'Courier New', monospace;">
                        ${vars.otp_code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#fff7ed; border-radius:8px; border:1px solid #fed7aa;
                       margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0; font-size:14px; color:#92400e; line-height:1.6;">
                      Este codigo expira en <strong>5 minutos</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${vars.verify_link}"
                       target="_blank"
                       style="display:inline-block; background-color:#0031FB; color:#ffffff;
                              text-decoration:none; font-size:15px; font-weight:700;
                              padding:14px 40px; border-radius:8px; letter-spacing:0.3px;
                              mso-padding-alt:0; text-align:center;">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 20px 0; font-size:12px; color:#9ca3af; text-align:center; line-height:1.6;">
                Si el boton no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${vars.verify_link}" style="color:#0031FB; word-break:break-all;">
                  ${vars.verify_link}
                </a>
              </p>

              <!-- Security note -->
              <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6; text-align:center;">
                Si no solicitaste este codigo, puedes ignorar este mensaje de forma segura.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e5e7eb;
                       padding:18px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                © ${new Date().getFullYear()} PayPac. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `,
},

//-------- ORGANOZER, STAFF --
  //Verificación aceptando ser staff 
  REGISTRATION_ACCEPT: {
    subject: 'NOTIFICACION PAYPAC: Has sido invitado a unirte a PayPac',
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

NOTIFICATION_ASSIGNING_EVENT: {
  subject: 'NOTIFICACION PAYPAC: Asignación de Evento',
  requiredVariables: ['user_name', 'name', 'image', 'date_event', 'place_address', 'company', 'rol'],
  html: (vars) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Asignación de Evento - PayPac</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f0f2f5; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

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

          <!-- Event cover image -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <img
                src="${vars.image}"
                alt="${vars.name}"
                width="100%"
                style="display:block; width:100%; height:180px; object-fit:cover;
                       border-radius:10px; border:1px solid #e5e7eb;"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px 0; font-size:22px; color:#111827; font-weight:700;">
                👋 Hola, ${vars.user_name}
              </h2>

              <!-- Divider -->
              <div style="width:48px; height:4px; background-color:#0031FB; border-radius:2px; margin-bottom:24px;"></div>

              <!-- Message -->
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#374151;">
                <strong>${vars.company}</strong> te ha asignado como parte de su equipo para el siguiente evento.
                Tu rol asignado es:
              </p>

              <!-- Role badge -->
              <div style="margin-bottom:28px;">
                <span style="display:inline-block; background-color:#eff2ff; color:#0031FB;
                             font-size:13px; font-weight:700; letter-spacing:0.8px;
                             text-transform:uppercase; padding:6px 16px; border-radius:20px;
                             border:1px solid #c7d2fe;">
                  ${vars.rol}
                </span>
              </div>

              <!-- Event details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#f8fafc; border-radius:10px; border:1px solid #e5e7eb;
                       margin-bottom:28px;">

                <!-- Event name -->
                <tr>
                  <td style="padding:14px 18px; border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      Evento
                    </p>
                    <p style="margin:0; font-size:15px; color:#111827; font-weight:700;">
                      ${vars.name}
                    </p>
                  </td>
                </tr>

                <!-- Event date -->
                <tr>
                  <td style="padding:14px 18px; border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      📅 Fecha
                    </p>
                    <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">
                      ${vars.date_event}
                    </p>
                  </td>
                </tr>

                <!-- Event address -->
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      📍 Dirección
                    </p>
                    <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">
                      ${vars.place_address}
                    </p>
                  </td>
                </tr>

              </table>

              <!-- Security note -->
              <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6; text-align:center;">
                Si crees que recibiste este mensaje por error, contáctanos en
                <a href="mailto:soporte@paypac.com.co" style="color:#0031FB;">soporte@paypac.com.co</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e5e7eb;
                       padding:18px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                © ${new Date().getFullYear()} PayPac. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `,
},

/*==========================================================*/  
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

TICKET_PURCHASE: {
  subject: '¡Tu compra fue exitosa! - ${vars.event_name}',
  requiredVariables: ['user_name', 'event_name', 'tickets_qty', 'total_amount'],
  html: (vars) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compra exitosa - PayPac</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f0f2f5; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

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

          <!-- Success banner -->
          <tr>
            <td style="background-color:#f0fdf4; padding:20px 32px; text-align:center;
                       border-top:1px solid #bbf7d0; border-bottom:1px solid #bbf7d0;">
              <p style="margin:0; font-size:36px; line-height:1;">✅</p>
              <p style="margin:8px 0 0 0; font-size:16px; font-weight:700; color:#15803d;">
                ¡Pago procesado exitosamente!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px 0; font-size:22px; color:#111827; font-weight:700;">
                👋 Hola, ${vars.user_name}
              </h2>

              <!-- Divider -->
              <div style="width:48px; height:4px; background-color:#0031FB; border-radius:2px; margin-bottom:24px;"></div>

              <!-- Message -->
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#374151;">
                Tu compra ha sido confirmada. A continuación encontrarás el resumen de tu pedido:
              </p>

              <!-- Order summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#f8fafc; border-radius:10px; border:1px solid #e5e7eb;
                       margin-bottom:28px;">

                <!-- Event name -->
                <tr>
                  <td style="padding:14px 18px; border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      🎉 Evento
                    </p>
                    <p style="margin:0; font-size:15px; color:#111827; font-weight:700;">
                      ${vars.event_name}
                    </p>
                  </td>
                </tr>

                <!-- Tickets qty -->
                <tr>
                  <td style="padding:14px 18px; border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      🎟️ Cantidad de tickets
                    </p>
                    <p style="margin:0; font-size:14px; color:#111827; font-weight:600;">
                      ${vars.tickets_qty} ticket(s)
                    </p>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#9ca3af;
                               text-transform:uppercase; letter-spacing:0.6px;">
                      💳 Total pagado
                    </p>
                    <p style="margin:0; font-size:18px; color:#0031FB; font-weight:800;">
                      $${vars.total_amount}
                    </p>
                  </td>
                </tr>

              </table>

              <!-- Tickets note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#eff2ff; border-radius:8px; border:1px solid #c7d2fe;
                       margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0; font-size:14px; color:#3730a3; line-height:1.6;">
                      🎫 Tus tickets están disponibles en la sección <strong>Mi Wallet</strong> dentro de la app de PayPac.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <p style="margin:0; font-size:15px; color:#374151; line-height:1.7; text-align:center;">
                ¡Nos vemos en el evento! 🎶
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e5e7eb;
                       padding:18px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                ¿Tienes dudas? Escríbenos a
                <a href="mailto:soporte@paypac.com.co" style="color:#0031FB;">soporte@paypac.com.co</a><br/>
                © ${new Date().getFullYear()} PayPac. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `,
},
};

// ✅ Helper para renderizar subject con variables
export function renderSubject(subject: string, vars: Record<string, any>): string {
  return subject.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}