import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';

const companyService = new CompanyService();

/**
 * PROVISIONAL
 */
export const getCompanyFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.id);
    const result    = await companyService.getCompanyFollowers(companyId);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/companies
 * Crear empresa
 * Requiere: PAYPAC | ORGANIZER
 */
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role || '';
    const {
      company_name, company_description, company_logo, company_cover,
      company_phone_number, company_email, type_identification,
      num_identification, website, address, country_id, state_id,
      city_id, company_presentation,
    } = req.body;

    const result = await companyService.createCompany(
      {
        company_name, company_description, company_logo, company_cover,
        company_phone_number, company_email, type_identification,
        num_identification, website, address, country_id, state_id,
        city_id, company_presentation,
      },
      userId,
      userRole
    );

    res.status(201).json({
      message: 'Empresa creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/companies
 * Listar empresas (filtros según rol)
 * Acceso: todos los roles autenticados
 */
export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role || '';
    const { search, country_id, state_id, city_id, status } = req.query;

    const result = await companyService.getCompanies(
      {
        search: search as string | undefined,
        country_id: country_id ? Number(country_id) : undefined,
        state_id: state_id ? Number(state_id) : undefined,
        city_id: city_id ? Number(city_id) : undefined,
        status: status !== undefined ? Number(status) : undefined,
      },
      userId,
      userRole
    );

    res.status(200).json({
      message: 'Empresas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/companies/stats
 * Estadísticas de empresas
 * Requiere: PAYPAC
 */
export const getCompaniesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { country_id, status } = req.query;

    const result = await companyService.getCompaniesStats(userRole, {
      country_id: country_id ? Number(country_id) : undefined,
      status: status !== undefined ? Number(status) : undefined,
    });

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/companies/my-companies
 * Empresas del ORGANIZER autenticado
 * Requiere: ORGANIZER
 */
export const getMyCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;

    const result = await companyService.getMyCompanies(userId);

    res.status(200).json({
      message: 'Mis empresas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET MY COMPANY
 * 
 */
export const getMyCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole  = req.user!.role;
    const companyId = req.user!.company_id;

    if (!companyId) {
      res.status(400).json({ success: false, message: 'Tu cuenta no tiene una empresa asociada' });
      return;
    }

    const company = await companyService.getMyCompany(companyId, userRole);

    res.status(200).json({ success: true, data: company });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};


/**
 * GET /api/companies/:id
 * Empresa por ID
 * Acceso: todos los roles autenticados
 */
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await companyService.getCompanyById(Number(id), userId, userRole);

    res.status(200).json({
      message: 'Empresa obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/companies/:id
 * Actualizar empresa
 * Requiere: PAYPAC | ORGANIZER (solo las suyas y si no está aprobada)
 */
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role || '';
    const { id } = req.params;
    const {
      company_name, company_description, company_logo, company_cover,
      company_phone_number, company_email, type_identification,
      num_identification, website, address, country_id, state_id,
      city_id, company_presentation,
    } = req.body;

    const result = await companyService.updateCompany(
      Number(id),
      {
        company_name, company_description, company_logo, company_cover,
        company_phone_number, company_email, type_identification,
        num_identification, website, address, country_id, state_id,
        city_id, company_presentation,
      },
      userId,
      userRole
    );

    res.status(200).json({
      message: 'Empresa actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/companies/:id/approve
 * Aprobar empresa
 * Requiere: PAYPAC
 */
export const approveCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await companyService.approveCompany(Number(id), userRole);

    res.status(200).json({
      message: 'Empresa aprobada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/companies/:id/status
 * Actualizar status de empresa
 * Requiere: PAYPAC
 */
export const updateCompanyStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;
    const { status } = req.body;

    const result = await companyService.updateStatus(Number(id), status, userRole);

    res.status(200).json({
      message: 'Status actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/companies/:id
 * Eliminar empresa
 * Requiere: PAYPAC
 */
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await companyService.deleteCompany(Number(id), userRole);

    res.status(200).json({
      message: 'Empresa eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};