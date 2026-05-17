// src/templates/email-templates.ts

interface EmailTemplate {
  subject: (variables: Record<string, any>) => string;
  html: (variables: Record<string, any>) => string;
  requiredVariables: string[];
}

// ─── Tokens del design system ────────────────────────────────────────────────
// navy:#1A1A2E  blue:#0031FB  cyan:#00FFFB  gray-50:#F5F5F7  gray-100:#ECECF0
// gray-200:#DCDCE3  gray-500:#6E6E80  gray-700:#33333F  warning-bg:#FFF5E6
// warning-border:#F79009  warning-text:#B5660A  warning-body:#856404

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {

  /*
  REGISTRATION_VERIFY: {
    subject: () => 'Verifica tu cuenta en PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `...`,
  },
  */

  // Verificación de email — OTP solo (sin botón)
  REGISTRATION_VERIFY_MAIL_v1: {
    subject: () => 'Verifica tu cuenta en PayPac',
    requiredVariables: ['user_name', 'otp_code', 'verify_link'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Verifica tu cuenta en PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Gracias por registrarte en <strong>PayPac</strong>. Para completar tu registro,
                verifica tu email usando el siguiente código:
              </p>

              <div style="background-color:#F5F5F7;border:1px solid #ECECF0;border-radius:8px;padding:24px;text-align:center;margin:20px 0;">
                <div style="font-family:ui-monospace,'SF Mono',Menlo,'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#0031FB;letter-spacing:.32em;">
                  ${vars.otp_code}
                </div>
                <div style="font-size:13px;color:#6E6E80;margin-top:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Este código expira en <strong style="color:#B5660A;font-weight:600;">5 minutos</strong>
                </div>
              </div>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:24px 0 0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Verificación de email — OTP + botón de verificación
  REGISTRATION_VERIFY_MAIL: {
    subject: () => 'Verifica tu cuenta en PayPac',
    requiredVariables: ['user_name', 'otp_code', 'verify_link'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Verifica tu cuenta en PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Gracias por registrarte en <strong>PayPac</strong>. Para completar tu registro,
                verifica tu email usando el siguiente código:
              </p>

              <div style="background-color:#F5F5F7;border:1px solid #ECECF0;border-radius:8px;padding:24px;text-align:center;margin:20px 0;">
                <div style="font-family:ui-monospace,'SF Mono',Menlo,'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#0031FB;letter-spacing:.32em;">
                  ${vars.otp_code}
                </div>
                <div style="font-size:13px;color:#6E6E80;margin-top:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Este código expira en <strong style="color:#B5660A;font-weight:600;">5 minutos</strong>
                </div>
              </div>

              <a href="${vars.verify_link}"
                 style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Verificar mi cuenta
              </a>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin-bottom:24px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <a href="${vars.verify_link}" style="color:#0031FB;text-decoration:none;font-weight:500;">${vars.verify_link}</a>
              </p>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Verificación de email — Web (botón con código en URL, sin OTP visible)
  REGISTRATION_VERIFY_MAIL_WEB: {
    subject: () => 'Verifica tu cuenta en PayPac',
    requiredVariables: ['user_name', 'verify_link'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Verifica tu cuenta en PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:24px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Gracias por registrarte en <strong>PayPac</strong>. Haz clic en el botón para
                verificar tu dirección de email y activar tu cuenta.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#0031FB;">
                    <a href="${vars.verify_link}"
                       style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <a href="${vars.verify_link}" style="color:#0031FB;text-decoration:none;font-weight:500;word-break:break-all;">${vars.verify_link}</a>
              </p>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Este enlace expira en <strong style="color:#B5660A;font-weight:600;">5 minutos</strong>.
                Si no solicitaste esta verificación, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Invitación a unirse como organizer / staff
  REGISTRATION_ACCEPT: {
    subject: () => 'NOTIFICACION PAYPAC: Has sido invitado a unirte a PayPac',
    requiredVariables: [
      'name',
      'last_name',
      'inviter_name',
      'inviter_last_name',
      'role',
      'email',
      'accept_link',
    ],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Invitación PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.inviter_name} ${vars.inviter_last_name}</strong>
                te ha invitado a ser parte de su equipo en PayPac.
              </p>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Se te ha asignado el rol de:
              </p>

              <span style="display:inline-block;background:linear-gradient(90deg,#0031FB,#00FFFB);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:6px 14px;border-radius:999px;margin:8px 0 20px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ${vars.role}
              </span>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Cuenta asignada
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  <a href="mailto:${vars.email}" style="color:#0031FB;text-decoration:none;font-weight:500;">${vars.email}</a>
                </div>
              </div>

              <a href="${vars.accept_link}"
                 style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Aceptar invitación
              </a>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin-bottom:24px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <a href="${vars.accept_link}" style="color:#0031FB;text-decoration:none;font-weight:500;">${vars.accept_link}</a>
              </p>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Login con código OTP
  LOGIN_OTP: {
    subject: () => 'Tu código de acceso a PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Tu código de acceso - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Tu código de acceso a <strong>PayPac</strong> es:
              </p>

              <div style="background-color:#F5F5F7;border:1px solid #ECECF0;border-radius:8px;padding:24px;text-align:center;margin:20px 0;">
                <div style="font-family:ui-monospace,'SF Mono',Menlo,'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#0031FB;letter-spacing:.32em;">
                  ${vars.otp_code}
                </div>
                <div style="font-size:13px;color:#6E6E80;margin-top:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Válido por <strong style="color:#B5660A;font-weight:600;">5 minutos</strong>
                </div>
              </div>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:24px 0 0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no intentaste iniciar sesión, ignora este mensaje y asegúrate de que tu cuenta esté protegida.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Asignación de staff a un evento
  NOTIFICATION_ASSIGNING_EVENT: {
    subject: () => 'NOTIFICACION PAYPAC: Asignación de Evento',
    requiredVariables: ['user_name', 'name', 'image', 'date_event', 'place_address', 'company', 'rol'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Asignación de Evento - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.company}</strong> te ha asignado como parte de su equipo. Tu rol asignado es:
              </p>

              <span style="display:inline-block;background:linear-gradient(90deg,#0031FB,#00FFFB);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:6px 14px;border-radius:999px;margin:8px 0 20px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ${vars.rol}
              </span>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0 8px;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Evento
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.name}
                </div>
              </div>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:8px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Fecha
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.date_event}
                </div>
              </div>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:8px 0 16px;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Lugar
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.place_address}
                </div>
              </div>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¿Tienes preguntas? Escríbenos a
                <a href="mailto:soporte@paypac.co" style="color:#0031FB;text-decoration:none;font-weight:500;">soporte@paypac.co</a>.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Restablecimiento de contraseña
  PASSWORD_RESET: {
    subject: () => 'Restablece tu contraseña de PayPac',
    requiredVariables: ['user_name', 'otp_code'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Restablece tu contraseña - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>PayPac</strong>.
                Usa el siguiente código para continuar:
              </p>

              <div style="background-color:#F5F5F7;border:1px solid #ECECF0;border-radius:8px;padding:24px;text-align:center;margin:20px 0;">
                <div style="font-family:ui-monospace,'SF Mono',Menlo,'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:#0031FB;letter-spacing:.32em;">
                  ${vars.otp_code}
                </div>
                <div style="font-size:13px;color:#6E6E80;margin-top:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Este código expira en <strong style="color:#B5660A;font-weight:600;">5 minutos</strong>
                </div>
              </div>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:24px 0 0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no solicitaste este cambio, ignora este mensaje. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Estado de una transacción / factura
  INVOICE_STATUS: {
    subject: (vars) => `Estado de tu transacción PayPac — ${vars.num_invoice}`,
    requiredVariables: [
      'user_name',
      'num_invoice',
      'status',
      'status_message',
      'amount',
      'payment_method_type',
    ],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Estado de tu transacción - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                A continuación encontrarás el estado de tu transacción en <strong>PayPac</strong>:
              </p>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0 8px;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Referencia
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:ui-monospace,'SF Mono',Menlo,'Courier New',Courier,monospace;">
                  ${vars.num_invoice}
                </div>
              </div>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:8px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Estado
                </div>
                <span style="display:inline-block;background:linear-gradient(90deg,#0031FB,#00FFFB);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:6px 14px;border-radius:999px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.status_message}
                </span>
              </div>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:8px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Total
                </div>
                <div style="font-size:20px;color:#0031FB;font-weight:700;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  $${vars.amount} COP
                </div>
              </div>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:8px 0 16px;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Método de pago
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.payment_method_type}
                </div>
              </div>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¿Tienes preguntas sobre esta transacción? Escríbenos a
                <a href="mailto:soporte@paypac.co" style="color:#0031FB;text-decoration:none;font-weight:500;">soporte@paypac.co</a>.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Confirmación de compra de tickets
  TICKET_PURCHASE: {
    subject: (vars) => `¡Tu compra fue exitosa! — ${vars.event_name}`,
    requiredVariables: ['user_name', 'event_name', 'tickets_qty', 'total_amount'],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Compra confirmada - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¡Tu compra fue confirmada!
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.user_name}. Recibimos tu pago correctamente.
                A continuación encontrarás el detalle de tu ticket.
                Te lo enviamos también a tu wallet de PayPac.
              </p>

              <!-- Ticket detail -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="border:1px solid #ECECF0;border-radius:8px;margin:24px 0;overflow:hidden;">
                <tr>
                  <td style="padding:24px;">

                    <p style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      Detalle del pedido
                    </p>
                    <p style="font-size:20px;font-weight:700;color:#1A1A2E;margin-bottom:16px;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      ${vars.event_name}
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:14px;color:#6E6E80;font-weight:500;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                          Cantidad
                        </td>
                        <td style="font-size:14px;color:#1A1A2E;font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                          ${vars.tickets_qty} ticket(s)
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size:16px;color:#1A1A2E;font-weight:600;padding-top:16px;border-top:2px solid #DCDCE3;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                                Total pagado
                              </td>
                              <td style="font-size:20px;color:#1A1A2E;font-weight:700;text-align:right;padding-top:16px;border-top:2px solid #DCDCE3;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                                $${vars.total_amount}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <a href="https://paypac.co/tickets"
                 style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Ver mi ticket
              </a>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#FFF5E6;border-radius:8px;border-left:3px solid #F79009;margin:16px 0;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#856404;line-height:1.5;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                    Presenta tu ticket digital en la entrada del evento.
                    Disponible en la app PayPac. No compartas tu QR &mdash; es único e intransferible.
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si tienes dudas sobre tu compra, escríbenos a
                <a href="mailto:soporte@paypac.co" style="color:#0031FB;text-decoration:none;font-weight:500;">soporte@paypac.co</a>.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Ticket recibido por transferencia (usuario registrado)
  TICKET_TRANSFER_RECEIVED: {
    subject: (vars) => `${vars.sender_name} te envió un ticket para ${vars.event_name}`,
    requiredVariables: [
      'recipient_name', 'sender_name', 'sender_message',
      'event_name', 'event_image', 'event_date', 'event_address',
      'locality_name', 'wallet_link',
    ],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Ticket recibido - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.recipient_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.sender_name}</strong> te ha enviado un ticket.
                Revisa los detalles y acéptalo antes de que expire.
              </p>

              ${vars.sender_message ? `
              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #0031FB;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Mensaje de ${vars.sender_name}
                </div>
                <div style="font-size:14px;color:#33333F;line-height:1.6;font-style:italic;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  &ldquo;${vars.sender_message}&rdquo;
                </div>
              </div>
              ` : ''}

              <!-- Ticket detail -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="border:1px solid #ECECF0;border-radius:8px;margin:24px 0;overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    <p style="font-size:20px;font-weight:700;color:#1A1A2E;margin-bottom:16px;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      ${vars.event_name}
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:14px;color:#6E6E80;font-weight:500;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">Fecha</td>
                        <td style="font-size:14px;color:#1A1A2E;font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">${vars.event_date}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#6E6E80;font-weight:500;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">Lugar</td>
                        <td style="font-size:14px;color:#1A1A2E;font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #ECECF0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">${vars.event_address}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#6E6E80;font-weight:500;padding:10px 0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">Localidad</td>
                        <td style="font-size:14px;color:#1A1A2E;font-weight:600;text-align:right;padding:10px 0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">${vars.locality_name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#FFF5E6;border-radius:8px;border-left:3px solid #F79009;margin:16px 0;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#856404;line-height:1.5;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                    Tienes <strong>30 minutos</strong> para aceptar este ticket. Después volverá al remitente.
                  </td>
                </tr>
              </table>

              <a href="${vars.wallet_link}"
                 style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Ver en mi Wallet
              </a>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Si no esperabas este ticket, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Ticket recibido por transferencia (usuario NO registrado)
  TICKET_TRANSFER_RECEIVED_UNREGISTERED: {
    subject: () => 'Alguien te envió un ticket en PayPac',
    requiredVariables: [
      'sender_name', 'event_name',
      'appstore_link', 'playstore_link',
    ],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Ticket pendiente - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Tienes un ticket esperándote
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.sender_name}</strong> quiso enviarte un ticket para
                <strong>${vars.event_name}</strong> a través de PayPac.
              </p>

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Información destacada
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Descarga la app, créate una cuenta con este mismo email o celular,
                  y el ticket aparecerá en tu <strong>Wallet</strong> automáticamente.
                </div>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#FFF5E6;border-radius:8px;border-left:3px solid #F79009;margin:16px 0;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#856404;line-height:1.5;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                    Este ticket está reservado para ti por <strong>48 horas</strong>. Después volverá al remitente.
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:12px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Descarga PayPac gratis:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-right:8px;width:50%;">
                    <a href="${vars.appstore_link}" target="_blank"
                       style="display:block;background-color:#1A1A2E;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 20px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      App Store
                    </a>
                  </td>
                  <td style="padding-left:8px;width:50%;">
                    <a href="${vars.playstore_link}" target="_blank"
                       style="display:block;background-color:#1A1A2E;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 20px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                      Google Play
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¿Tienes preguntas? Escríbenos a
                <a href="mailto:soporte@paypac.co" style="color:#0031FB;text-decoration:none;font-weight:500;">soporte@paypac.co</a>.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // Estado de transferencia de ticket (para el remitente)
  TICKET_TRANSFER_STATUS: {
    subject: (vars) => `Tu ticket para ${vars.event_name} — ${vars.status === 'ACCEPTED' ? 'Aceptado' : vars.status === 'REJECTED' ? 'Rechazado' : 'Pendiente de registro'}`,
    requiredVariables: [
      'sender_name', 'recipient_name', 'event_name',
      'status', 'wallet_link',
    ],
    html: (vars) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <title>Estado de transferencia - PayPac</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Inter','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F5F5F7">
    <tr>
      <td align="center" style="padding:48px 24px 0 24px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:28px 32px 0 32px;text-align:center;">
              <img src="https://fabritek.co/paypac/logos/logo_paypac.png" alt="PayPac"
                height="24" style="display:inline-block;height:24px;" />
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1A1A2E;letter-spacing:-.01em;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hola, ${vars.sender_name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>

              ${vars.status === 'ACCEPTED' ? `
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.recipient_name}</strong> aceptó el ticket para
                <strong>${vars.event_name}</strong>. La transferencia fue completada exitosamente.
              </p>
              ` : vars.status === 'REJECTED' ? `
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.recipient_name}</strong> rechazó el ticket para
                <strong>${vars.event_name}</strong>.
                Tu ticket está de vuelta en tu <strong>Wallet</strong> y puedes enviarlo a alguien más.
              </p>
              ` : `
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                <strong style="color:#1A1A2E;">${vars.recipient_name}</strong> aún no está registrado en PayPac.
                Le enviamos un mensaje para que descargue la app.
                Tu ticket permanece <strong>reservado para él/ella por 48 horas</strong>.
              </p>
              `}

              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Evento
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${vars.event_name}
                </div>
              </div>

              ${vars.status !== 'ACCEPTED' ? `
              <a href="${vars.wallet_link}"
                 style="display:inline-block;background-color:#0031FB;color:#ffffff;text-decoration:none;height:52px;line-height:52px;padding:0 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Ver mi Wallet
              </a>
              ` : ''}

              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¿Tienes preguntas? Escríbenos a
                <a href="mailto:soporte@paypac.co" style="color:#0031FB;text-decoration:none;font-weight:500;">soporte@paypac.co</a>.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:16px 0 48px;text-align:center;font-size:12px;color:#6E6E80;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
          &copy; ${new Date().getFullYear()} <strong style="color:#33333F;font-weight:600;">PayPac</strong>. Todos los derechos reservados.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`,
  },

};

export function renderSubject(subject: string, vars: Record<string, any>): string {
  return subject.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
}
