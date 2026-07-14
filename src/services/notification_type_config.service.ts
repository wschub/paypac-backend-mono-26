import { NotificationTypeConfigRepository } from '../repositories/notification_type_config.repository';
import { Prisma, NotificationType } from '@prisma/client';

const typeConfigRepo = new NotificationTypeConfigRepository();

export class NotificationTypeConfigService {
  /**
   * Listar la config de todos los tipos de notificación — solo PAYPAC.
   * Auto-sincroniza filas faltantes si se agregaron valores nuevos al enum.
   */
  async getAll(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver la configuración de tipos de notificación');
    }

    await typeConfigRepo.syncMissingTypes();
    return typeConfigRepo.findAll();
  }

  async getById(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver la configuración de tipos de notificación');
    }

    const config = await typeConfigRepo.findById(id);
    if (!config) throw new Error('Configuración no encontrada');
    return config;
  }

  /**
   * Actualizar config de un tipo — solo PAYPAC. notification_type es fijo
   * (viene del enum), solo se editan is_mandatory y los 4 canales.
   */
  async update(
    id: number,
    data: {
      is_mandatory?: boolean;
      channel_web?: boolean;
      channel_push?: boolean;
      channel_whatsapp?: boolean;
      channel_email?: boolean;
    },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede editar la configuración de tipos de notificación');
    }

    const config = await typeConfigRepo.findById(id);
    if (!config) throw new Error('Configuración no encontrada');

    const merged = {
      channel_web: data.channel_web ?? config.channel_web,
      channel_push: data.channel_push ?? config.channel_push,
      channel_whatsapp: data.channel_whatsapp ?? config.channel_whatsapp,
      channel_email: data.channel_email ?? config.channel_email,
    };
    if (!merged.channel_web && !merged.channel_push && !merged.channel_whatsapp && !merged.channel_email) {
      throw new Error('Debes habilitar al menos un canal para este tipo de notificación');
    }

    const updateData: Prisma.NotificationTypeConfigUpdateInput = {};
    if (data.is_mandatory !== undefined) updateData.is_mandatory = data.is_mandatory;
    if (data.channel_web !== undefined) updateData.channel_web = data.channel_web;
    if (data.channel_push !== undefined) updateData.channel_push = data.channel_push;
    if (data.channel_whatsapp !== undefined) updateData.channel_whatsapp = data.channel_whatsapp;
    if (data.channel_email !== undefined) updateData.channel_email = data.channel_email;

    return typeConfigRepo.update(id, updateData);
  }
}
