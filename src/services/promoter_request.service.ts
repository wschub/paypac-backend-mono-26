import { PromoterRequestRepository } from '../repositories/promoter_request.repository';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../prisma/client';
import { BrevoService } from './brevo.service';

const requestRepo = new PromoterRequestRepository();
const userRepo    = new UserRepository();
const brevo       = new BrevoService();

export class PromoterRequestService {

  async apply(userId: number, motivation?: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    if (user.role === 'PROMOTER') {
      throw new Error('Ya eres promotor');
    }

    const existing = await requestRepo.findPendingByUserId(userId);
    if (existing) {
      throw new Error('Ya tienes una solicitud pendiente de revisión');
    }

    return requestRepo.create(userId, motivation);
  }

  async getMyRequest(userId: number) {
    const request = await requestRepo.findByUserId(userId);
    if (!request) throw new Error('No tienes solicitudes registradas');
    return request;
  }

  async getAll(status?: string) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const;
    const filter = validStatuses.find(s => s === status?.toUpperCase());
    return requestRepo.findAll(filter);
  }

  async approve(requestId: number, reviewerId: number) {
    const request = await requestRepo.findById(requestId);
    if (!request) throw new Error('Solicitud no encontrada');
    if (request.status !== 'PENDING') {
      throw new Error(`Esta solicitud ya fue ${request.status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.user_id },
        data: { role: 'PROMOTER', role_default: 'PROMOTER' },
      }),
      prisma.promoterRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', reviewed_by_id: reviewerId, reviewed_at: new Date() },
      }),
    ]);

    const updated = await requestRepo.findById(requestId);

    // Notificaciones (fire-and-forget)
    this._notifyApproved(request.user_id, request.user.name, request.user.email).catch(
      err => console.error('⚠️ Error enviando notificación de aprobación:', err)
    );

    return updated;
  }

  async reject(requestId: number, reviewerId: number, rejection_reason?: string) {
    const request = await requestRepo.findById(requestId);
    if (!request) throw new Error('Solicitud no encontrada');
    if (request.status !== 'PENDING') {
      throw new Error(`Esta solicitud ya fue ${request.status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
    }

    const updated = await requestRepo.updateStatus(requestId, 'REJECTED', reviewerId, rejection_reason);

    // Notificaciones (fire-and-forget)
    this._notifyRejected(request.user_id, request.user.name, request.user.email, rejection_reason).catch(
      err => console.error('⚠️ Error enviando notificación de rechazo:', err)
    );

    return updated;
  }

  private async _notifyApproved(userId: number, name: string, email: string) {
    await prisma.notificationQueue.create({
      data: {
        user_id: userId,
        notification_type: 'SYSTEM',
        channel: 'PUSH',
        title: '¡Felicitaciones! Eres promotor',
        body: 'Tu solicitud fue aprobada. Ya puedes crear tu código de promotor y empezar a ganar comisiones.',
      },
    });

    await brevo.sendEmail({
      to: { email, name },
      subject: 'Tu solicitud de promotor fue aprobada',
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
                Hola, ${name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Tu solicitud para convertirte en promotor de <strong>PayPac</strong> fue <strong>aprobada</strong>.
              </p>
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Ahora puedes ingresar a la app, crear tu código de promotor desde
                <strong>Mi Perfil &rarr; Código de Promotor</strong> y empezar a ganar comisiones
                por cada venta que generes.
              </p>
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
    });
  }

  private async _notifyRejected(userId: number, name: string, email: string, reason?: string) {
    await prisma.notificationQueue.create({
      data: {
        user_id: userId,
        notification_type: 'SYSTEM',
        channel: 'PUSH',
        title: 'Solicitud de promotor no aprobada',
        body: reason ?? 'Tu solicitud no fue aprobada en esta ocasión. Puedes volver a aplicar más adelante.',
      },
    });

    await brevo.sendEmail({
      to: { email, name },
      subject: 'Actualización sobre tu solicitud de promotor',
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
                Hola, ${name}
              </h2>
              <span style="display:block;width:32px;height:3px;background:#0031FB;background:linear-gradient(90deg,#0031FB,#00FFFB);border-radius:2px;margin:0 0 20px;"></span>
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Hemos revisado tu solicitud para ser promotor en <strong>PayPac</strong> y en esta ocasión no fue aprobada.
              </p>
              ${reason ? `
              <div style="background-color:#F5F5F7;border-radius:8px;padding:16px 20px;margin:16px 0;">
                <div style="font-size:11px;font-weight:600;color:#6E6E80;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  Motivo
                </div>
                <div style="font-size:15px;color:#1A1A2E;font-weight:500;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                  ${reason}
                </div>
              </div>
              ` : ''}
              <p style="font-size:15px;color:#33333F;line-height:1.6;margin-bottom:16px;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                Puedes volver a aplicar en el futuro.
              </p>
              <p style="font-size:13px;color:#6E6E80;line-height:1.5;margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
                ¿Crees que hay un error? Escríbenos a
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
    });
  }
}
