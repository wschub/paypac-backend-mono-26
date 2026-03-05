import { CompanyRepository } from '../repositories/company.repository';
import { CountriesRepository } from '../repositories/countries.repository';
import { StatesRepository } from '../repositories/states.repository';
import { CitiesRepository } from '../repositories/cities.repository';

const companyRepo = new CompanyRepository();
const countriesRepo = new CountriesRepository();
const statesRepo = new StatesRepository();
const citiesRepo = new CitiesRepository();


export class CompanyService {


  /**
 * PROVISIONAL
 */
async getCompanyFollowers(companyId: number) {
  const company = await companyRepo.findById(companyId);
  if (!company) throw new Error('Empresa no encontrada');

  // TODO: reemplazar con queries reales cuando exista la entidad CompanyFollower
  return {
    total_followers:    1234,
    growth_percentage:  15.5,
    new_this_month:     48,
    last_follower_date: '2025-03-01',
    trending:           'up',
  };
}


  /**
   * Crear empresa
   * - PAYPAC: puede crear cualquier empresa
   * - ORGANIZER: crea su propia empresa (se asigna como registeredBy)
   */
  async createCompany(
    data: {
      company_name: string;
      company_description?: string;
      company_logo?: string;
      company_cover?: string;
      company_phone_number?: string;
      company_email?: string;
      type_identification?: string;
      num_identification?: string;
      website?: string;
      address?: string;
      country_id?: number;
      state_id?: number;
      city_id?: number;
      company_presentation?: string;
    },
    userId: number,
    userRole: string
  ) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
      throw new Error('No tienes permisos para crear empresas');
    }

    // Validar nombre único
    if (await companyRepo.findByName(data.company_name)) {
      throw new Error(`Ya existe una empresa con el nombre "${data.company_name}"`);
    }

    // Validar email único si se provee
    if (data.company_email && await companyRepo.findByEmail(data.company_email)) {
      throw new Error(`Ya existe una empresa con el email "${data.company_email}"`);
    }

    // Validar ubicación si se provee
    await this.validateLocation(data.country_id, data.state_id, data.city_id);

    return companyRepo.create({
      ...data,
      company_presentation: data.company_presentation ?? '',
      user_id_register: userId,
      // PAYPAC aprueba automáticamente, ORGANIZER queda pendiente
      status: userRole === 'PAYPAC' ? 1 : 0,
      approved_at: userRole === 'PAYPAC' ? new Date() : null,
    });
  }

  /**
   * Listar empresas
   * - PAYPAC: ve todas con cualquier filtro
   * - ORGANIZER: solo ve las suyas
   * - Resto: solo empresas aprobadas (status: 1)
   */
  async getCompanies(
    filters: {
      search?: string;
      country_id?: number;
      state_id?: number;
      city_id?: number;
      status?: number;
    },
    userId: number,
    userRole: string
  ) {
    if (userRole === 'ORGANIZER') {
      return companyRepo.findByRegisteredUser(userId);
    }

    if (!['PAYPAC', 'STAFF'].includes(userRole)) {
      return companyRepo.findAll({ ...filters, status: 1 });
    }

    return companyRepo.findAll(filters);
  }

  /**
   * Empresa por ID
   */
  async getCompanyById(id: number, userId: number, userRole: string) {
    const company = await companyRepo.findById(id);
    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // ORGANIZER solo puede ver las suyas
    if (userRole === 'ORGANIZER' && company.user_id_register !== userId) {
      throw new Error('No tienes acceso a esta empresa');
    }

    // Otros roles no PAYPAC/STAFF solo ven empresas aprobadas
    if (!['PAYPAC', 'STAFF', 'ORGANIZER'].includes(userRole) && company.status !== 1) {
      throw new Error('Empresa no encontrada');
    }

    return company;
  }

  /**
   * Mis empresas (para ORGANIZER)
   */
  async getMyCompanies(userId: number) {
    return companyRepo.findByRegisteredUser(userId);
  }

  /**
   * Actualizar empresa
   * - PAYPAC: puede editar cualquier empresa
   * - ORGANIZER: solo puede editar las suyas y solo si no está aprobada
   */
  async updateCompany(
    id: number,
    data: {
      company_name?: string;
      company_description?: string;
      company_logo?: string;
      company_cover?: string;
      company_phone_number?: string;
      company_email?: string;
      type_identification?: string;
      num_identification?: string;
      website?: string;
      address?: string;
      country_id?: number;
      state_id?: number;
      city_id?: number;
      company_presentation?: string;
    },
    userId: number,
    userRole: string
  ) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
      throw new Error('No tienes permisos para actualizar empresas');
    }

    const company = await companyRepo.findById(id);
    if (!company) throw new Error('Empresa no encontrada');

    if (userRole === 'ORGANIZER') {
      if (company.user_id_register !== userId) {
        throw new Error('No puedes editar una empresa que no registraste');
      }
      if (company.status === 1) {
        throw new Error('No puedes editar una empresa ya aprobada. Contacta a PAYPAC');
      }
    }

    // Validar nombre único excluyendo la empresa actual
    if (data.company_name && data.company_name !== company.company_name) {
      const existing = await companyRepo.findByName(data.company_name);
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe una empresa con el nombre "${data.company_name}"`);
      }
    }

    // Validar email único excluyendo la empresa actual
    if (data.company_email && data.company_email !== company.company_email) {
      const existing = await companyRepo.findByEmail(data.company_email);
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe una empresa con el email "${data.company_email}"`);
      }
    }

    // Validar ubicación
    await this.validateLocation(data.country_id, data.state_id, data.city_id);

    return companyRepo.update(id, data);
  }

  /**
   * Aprobar empresa — solo PAYPAC
   */
  async approveCompany(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede aprobar empresas');
    }

    const company = await companyRepo.findById(id);
    if (!company) throw new Error('Empresa no encontrada');

    if (company.status === 1) {
      throw new Error('La empresa ya está aprobada');
    }

    return companyRepo.approve(id);
  }

  /**
   * Actualizar status — solo PAYPAC
   */
  async updateStatus(id: number, status: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede cambiar el status de una empresa');
    }

    const company = await companyRepo.findById(id);
    if (!company) throw new Error('Empresa no encontrada');

    return companyRepo.updateStatus(id, status);
  }

  /**
   * Eliminar empresa — solo PAYPAC
   */
  async deleteCompany(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar empresas');
    }

    const company = await companyRepo.findById(id);
    if (!company) throw new Error('Empresa no encontrada');

    const userCount = (company as any)._count?.users ?? 0;
    if (userCount > 0) {
      throw new Error(
        `No se puede eliminar: la empresa tiene ${userCount} usuario(s) asociado(s).`
      );
    }

    return companyRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   */
  async getCompaniesStats(
    userRole: string,
    filters?: { country_id?: number; status?: number }
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return companyRepo.getStats(filters);
  }

  /*
   PROFILE-COMPANY
  */
  async getMyCompany(companyId: number, userRole: string) {
  if (userRole !== 'ORGANIZER') throw new Error('Solo ORGANIZER puede acceder a su perfil de empresa');

  if (!companyId) throw new Error('Tu cuenta no tiene una empresa asociada');

  const company = await companyRepo.findById(companyId);
  if (!company) throw new Error('Empresa no encontrada');

  return company;
}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Validar coherencia de ubicación
   */
  private async validateLocation(
    country_id?: number,
    state_id?: number,
    city_id?: number
  ) {
    if (country_id) {
      const country = await countriesRepo.findById(country_id);
      if (!country) throw new Error(`El país con ID ${country_id} no existe`);
    }

    if (state_id) {
      const state = await statesRepo.findById(state_id);
      if (!state) throw new Error(`El estado con ID ${state_id} no existe`);

      if (country_id && state.country_id !== country_id) {
        throw new Error('El estado no pertenece al país indicado');
      }
    }

    if (city_id) {
      const city = await citiesRepo.findById(city_id);
      if (!city) throw new Error(`La ciudad con ID ${city_id} no existe`);

      if (state_id && city.state_id !== state_id) {
        throw new Error('La ciudad no pertenece al estado indicado');
      }
    }
  }
}