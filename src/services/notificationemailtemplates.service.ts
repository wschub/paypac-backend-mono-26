import { NotificationEmailTemplatesRepository } from '../repositories/notificationemailtemplates.repository';
import { Prisma, TemplateTypes } from '@prisma/client';
import { extractVariablesFromTemplate } from '../utils/template-renderer';

const templateRepo = new NotificationEmailTemplatesRepository();

export class NotificationEmailTemplatesService {
  /**
   * Crear un nuevo template
   * Solo PAYPAC puede crear templates
   */
  async createTemplate(
    data: Prisma.NotificationEmailTemplatesCreateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear templates de email');
    }

    // Validar que no exista un template con el mismo código
    const existingTemplate = await templateRepo.findByCode(data.template_code);
    if (existingTemplate) {
      throw new Error(`Ya existe un template con el código "${data.template_code}"`);
    }

    // Auto-extraer variables del template si no se proporcionaron
    if (!data.template_variables || data.template_variables.length === 0) {
      // Asumiendo que tienes un campo htmlContent o similar
      // Por ahora, las variables deben proporcionarse manualmente
      console.warn('⚠️ No se proporcionaron variables para el template');
    }

    return templateRepo.create(data);
  }

  /**
   * Obtener todos los templates
   * Puede filtrar por tipo
   */
  async getTemplates(filters?: { template_type?: TemplateTypes }) {
    return templateRepo.findAll(filters);
  }

  /**
   * Obtener template por ID
   */
  async getTemplateById(id: number) {
    const template = await templateRepo.findById(id);
    if (!template) {
      throw new Error('Template no encontrado');
    }
    return template;
  }

  /**
   * Obtener template por código
   */
  async getTemplateByCode(templateCode: string) {
    const template = await templateRepo.findByCode(templateCode);
    if (!template) {
      throw new Error(`Template con código "${templateCode}" no encontrado`);
    }
    return template;
  }

  /**
   * Obtener templates por tipo
   */
  async getTemplatesByType(templateType: TemplateTypes) {
    return templateRepo.findByType(templateType);
  }

  /**
   * Actualizar template
   * Solo PAYPAC puede actualizar
   */
  async updateTemplate(
    id: number,
    data: Prisma.NotificationEmailTemplatesUpdateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar templates de email');
    }

    const template = await templateRepo.findById(id);
    if (!template) {
      throw new Error('Template no encontrado');
    }

    // Si se está cambiando el código, validar que no exista otro con ese código
    if (data.template_code && typeof data.template_code === 'string') {
      const existingTemplate = await templateRepo.findByCode(data.template_code);
      if (existingTemplate && existingTemplate.id !== id) {
        throw new Error(`Ya existe otro template con el código "${data.template_code}"`);
      }
    }

    return templateRepo.update(id, data);
  }

  /**
   * Eliminar template
   * Solo PAYPAC puede eliminar
   */
  async deleteTemplate(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar templates de email');
    }

    const template = await templateRepo.findById(id);
    if (!template) {
      throw new Error('Template no encontrado');
    }

    // TODO: Validar que no haya mensajes en cola usando este template
    // const messagesUsingTemplate = await prisma.notificationMessageQueue.count({
    //   where: { template_id: id, status: 0 }
    // });
    // if (messagesUsingTemplate > 0) {
    //   throw new Error('No se puede eliminar: hay mensajes pendientes usando este template');
    // }

    return templateRepo.delete(id);
  }

  /**
   * Obtener estadísticas de templates
   */
  async getTemplateStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const allTemplates = await templateRepo.findAll();

    // Agrupar por tipo
    const byType = allTemplates.reduce((acc, template) => {
      acc[template.template_type] = (acc[template.template_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: allTemplates.length,
      by_type: byType,
      templates: allTemplates,
    };
  }
}