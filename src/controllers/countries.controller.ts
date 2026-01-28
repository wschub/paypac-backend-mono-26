import { Request, Response } from 'express';
import { CountriesService } from '../services/countries.service';

const countriesService = new CountriesService();

/**
 * POST /api/countries
 * Crear un nuevo país
 * Requiere: PAYPAC
 */
export const createCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name_country, code, phone_code, currency, language_default } = req.body;
    const userRole = req.user?.role || '';

    const result = await countriesService.createCountry(
      {
        name_country,
        code,
        phone_code,
        currency,
        language_default,
      },
      userRole
    );

    res.status(201).json({
      message: 'País creado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/countries
 * Listar todos los países
 * Requiere: PAYPAC
 * 
 * Query params opcionales:
 * - search: string (buscar por nombre o código)
 * - code: string (filtrar por código ISO)
 */
export const getCountries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, code } = req.query;

    const filters = {
      search: search as string | undefined,
      code: code as string | undefined,
    };

    const result = await countriesService.getCountries(filters);

    res.status(200).json({
      message: 'Países obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/countries/with-relations
 * Listar países con estados y ciudades
 * Requiere: PAYPAC
 */
export const getCountriesWithRelations = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await countriesService.getCountriesWithRelations();

    res.status(200).json({
      message: 'Países con relaciones obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/countries/stats
 * Obtener estadísticas de países
 * Requiere: PAYPAC
 */
export const getCountriesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await countriesService.getCountriesStats(userRole);

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/countries/:id
 * Obtener país por ID
 * Requiere: PAYPAC
 */
export const getCountryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await countriesService.getCountryById(Number(id));

    res.status(200).json({
      message: 'País obtenido exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/countries/:id
 * Actualizar país
 * Requiere: PAYPAC
 */
export const updateCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name_country, code, phone_code, currency, language_default } = req.body;
    const userRole = req.user?.role || '';

    const result = await countriesService.updateCountry(
      Number(id),
      {
        name_country,
        code,
        phone_code,
        currency,
        language_default,
      },
      userRole
    );

    res.status(200).json({
      message: 'País actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/countries/:id
 * Eliminar país
 * Requiere: PAYPAC
 */
export const deleteCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await countriesService.deleteCountry(Number(id), userRole);

    res.status(200).json({
      message: 'País eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};