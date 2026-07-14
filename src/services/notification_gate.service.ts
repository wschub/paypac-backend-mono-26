import { prisma } from '../prisma/client';
import { NotificationType } from '@prisma/client';
import { NotificationTypeConfigRepository } from '../repositories/notification_type_config.repository';

const typeConfigRepo = new NotificationTypeConfigRepository();

type Channel = 'web' | 'push' | 'whatsapp' | 'email';

/**
 * Gate central para email/push: decide si un envío puntual debe salir,
 * según NotificationTypeConfig + NotificationPreference del usuario.
 *
 * Fail-open por diseño: si el tipo no tiene config, o el usuario no tiene
 * fila de preferencia (no es CUSTOMER, o nunca se le sembró), se permite el
 * envío. Esto es intencional — el gate solo debe BLOQUEAR cuando el usuario
 * explícitamente apagó ese canal para ese tipo, nunca por ausencia de datos.
 */
export class NotificationGateService {
  async shouldDeliver(userId: number, type: NotificationType, channel: Channel): Promise<boolean> {
    const config = await typeConfigRepo.findByType(type);
    if (!config) return true;

    const configChannelKey = `channel_${channel}` as const;

    if (config.is_mandatory) {
      return config[configChannelKey];
    }
    if (!config[configChannelKey]) return false;

    const pref = await prisma.notificationPreference.findUnique({
      where: { user_id_notification_type: { user_id: userId, notification_type: type } },
    });
    if (!pref) return true;

    return pref[configChannelKey];
  }
}

export const notificationGateService = new NotificationGateService();
