import { Request, Response } from 'express';
import { NotificationEmailTemplatesService } from '../services/notificationemailtemplates.service';
import { TemplateTypes } from '@prisma/client';

const templateService = new NotificationEmailTemplatesService();

/**
 * POST /api/email-templates
 * Crear un nuevo template
 * Requiere: PAYPAC
 */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { template_name, template_subject, template_code, template_type, template_variables } = req.body;
    const userRole = req.user?.role || '';

    const result = await templateService.createTemplate(
      {
        template_name,
        template_subject,
        template_code,
        template_type,
        template_variables,
      },
      userRole
    );

    res.status(201).json({
      message: 'Template creado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-templates
 * Listar todos los templates
 * Acceso: PAYPAC, ORGANIZER
 */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { template_type } = req.query;

    const filters = template_type
      ? { template_type: template_type as TemplateTypes }
      : undefined;

    const result = await templateService.getTemplates(filters);

    res.status(200).json({
      message: 'Templates obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-templates/stats
 * Obtener estadísticas de templates
 * Requiere: PAYPAC
 */
export const getTemplateStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await templateService.getTemplateStats(userRole);

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-templates/:id
 * Obtener template por ID
 * Acceso: PAYPAC, ORGANIZER
 */
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await templateService.getTemplateById(Number(id));

    res.status(200).json({
      message: 'Template obtenido exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/email-templates/:id
 * Actualizar template
 * Requiere: PAYPAC
 */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { template_name, template_subject, template_code, template_type, template_variables } = req.body;
    const userRole = req.user?.role || '';

    const result = await templateService.updateTemplate(
      Number(id),
      {
        template_name,
        template_subject,
        template_code,
        template_type,
        template_variables,
      },
      userRole
    );

    res.status(200).json({
      message: 'Template actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/email-templates/:id
 * Eliminar template
 * Requiere: PAYPAC
 */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await templateService.deleteTemplate(Number(id), userRole);

    res.status(200).json({
      message: 'Template eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};