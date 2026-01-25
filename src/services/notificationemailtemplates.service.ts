import { NotificationEmailTemplatesRepository } from '../repositories/notificationemailtemplates.repository';
import { Prisma, TemplateTypes } from '@prisma/client';

const templateRepo = new NotificationEmailTemplatesRepository();

export class NotificationEmailTemplatesService {

  async createTemplate(
    data: Prisma.NotificationEmailTemplatesCreateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear templates de email');
    }

    const existingTemplate = await templateRepo.findByCode(data.template_code);
    if (existingTemplate) {
      throw new Error(`Ya existe un template con el código "${data.template_code}"`);
    }

    if (!data.template_variables) {
      console.warn('⚠️ No se proporcionaron variables para el template');
    }

    return templateRepo.create(data);
  }

  async getTemplates(filters?: { template_type?: TemplateTypes }) {
    return templateRepo.findAll(filters);
  }

  async getTemplateById(id: number) {
    const template = await templateRepo.findById(id);
    if (!template) throw new Error('Template no encontrado');
    return template;
  }

  async getTemplateByCode(templateCode: string) {
    const template = await templateRepo.findByCode(templateCode);
    if (!template) throw new Error(`Template con código "${templateCode}" no encontrado`);
    return template;
  }

  async getTemplatesByType(templateType: TemplateTypes) {
    return templateRepo.findByType(templateType);
  }

  async updateTemplate(
    id: number,
    data: Prisma.NotificationEmailTemplatesUpdateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar templates de email');
    }

    const template = await templateRepo.findById(id);
    if (!template) throw new Error('Template no encontrado');

    if (data.template_code && typeof data.template_code === 'string') {
      const existingTemplate = await templateRepo.findByCode(data.template_code);
      if (existingTemplate && existingTemplate.id !== id) {
        throw new Error(`Ya existe otro template con el código "${data.template_code}"`);
      }
    }

    return templateRepo.update(id, data);
  }

  async deleteTemplate(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar templates de email');
    }

    const template = await templateRepo.findById(id);
    if (!template) throw new Error('Template no encontrado');

    return templateRepo.delete(id);
  }

  async getTemplateStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const allTemplates = await templateRepo.findAll();

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
