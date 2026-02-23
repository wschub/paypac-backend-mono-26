import { Request, Response } from 'express';
import { GeneralSettingsService } from '../services/generalsettings.service';

const settingsService = new GeneralSettingsService();

/**
 * POST /api/settings
 * Crear una variable de configuración
 * Requiere: PAYPAC
 */
export const createSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, value, description } = req.body;
    const userRole = req.user?.role || '';

    const result = await settingsService.createSetting({ name, value, description }, userRole);

    res.status(201).json({
      message: 'Variable de configuración creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/settings
 * Listar todas las variables de configuración
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - search: string (busca en name y description)
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { search } = req.query;

    const result = await settingsService.getSettings(userRole, {
      search: search as string | undefined,
    });

    res.status(200).json({
      message: 'Variables de configuración obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/settings/by-name/:name
 * Obtener variable por nombre (clave única)
 * Requiere: PAYPAC
 */
export const getSettingByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { name } = req.params;

    const result = await settingsService.getSettingByName(name, userRole);

    res.status(200).json({
      message: 'Variable de configuración obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/settings/:id
 * Obtener variable por ID
 * Requiere: PAYPAC
 */
export const getSettingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await settingsService.getSettingById(Number(id), userRole);

    res.status(200).json({
      message: 'Variable de configuración obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/settings/:id
 * Actualizar variable de configuración
 * Requiere: PAYPAC
 */
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, value, description } = req.body;
    const userRole = req.user?.role || '';

    const result = await settingsService.updateSetting(
      Number(id),
      { name, value, description },
      userRole
    );

    res.status(200).json({
      message: 'Variable de configuración actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/settings/:id
 * Eliminar variable de configuración
 * Requiere: PAYPAC
 */
export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await settingsService.deleteSetting(Number(id), userRole);

    res.status(200).json({
      message: 'Variable de configuración eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};