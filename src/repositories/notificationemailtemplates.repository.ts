import { prisma } from '../config/db';
import { NotificationEmailTemplates, Prisma, TemplateTypes } from '@prisma/client';

export class NotificationEmailTemplatesRepository {
  /**
   * Crear un nuevo template
   */
  async create(data: Prisma.NotificationEmailTemplatesCreateInput): Promise<NotificationEmailTemplates> {
    return prisma.notificationEmailTemplates.create({
      data,
    });
  }

  /**
   * Obtener todos los templates
   */
  async findAll(filters?: { template_type?: TemplateTypes }): Promise<NotificationEmailTemplates[]> {
    const where: Prisma.NotificationEmailTemplatesWhereInput = {};

    if (filters?.template_type) {
      where.template_type = filters.template_type;
    }

    return prisma.notificationEmailTemplates.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar template por ID
   */
  async findById(id: number): Promise<NotificationEmailTemplates | null> {
    return prisma.notificationEmailTemplates.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar template por código
   */
  async findByCode(templateCode: string): Promise<NotificationEmailTemplates | null> {
    return prisma.notificationEmailTemplates.findFirst({
      where: { template_code: templateCode },
    });
  }

  /**
   * Actualizar template
   */
  async update(id: number, data: Prisma.NotificationEmailTemplatesUpdateInput): Promise<NotificationEmailTemplates> {
    return prisma.notificationEmailTemplates.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar template
   */
  async delete(id: number): Promise<NotificationEmailTemplates> {
    return prisma.notificationEmailTemplates.delete({
      where: { id },
    });
  }

  /**
   * Verificar si existe un template
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.notificationEmailTemplates.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Buscar templates por tipo
   */
  async findByType(templateType: TemplateTypes): Promise<NotificationEmailTemplates[]> {
    return prisma.notificationEmailTemplates.findMany({
      where: { template_type: templateType },
      orderBy: { template_name: 'asc' },
    });
  }
}