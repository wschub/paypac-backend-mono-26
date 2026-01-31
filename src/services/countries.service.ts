import { CountriesRepository } from '../repositories/countries.repository';
import { Prisma } from '@prisma/client';

const countriesRepo = new CountriesRepository();

export class CountriesService {
  /**
   * Crear un nuevo país
   * Solo PAYPAC puede crear países
   */
  async createCountry(
    data: Prisma.CountriesCreateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear países');
    }

    // Validar que no exista un país con el mismo código ISO
    const existingCountryByCode = await countriesRepo.findByCode(data.code);
    if (existingCountryByCode) {
      throw new Error(`Ya existe un país con el código ISO "${data.code}"`);
    }

    // Validar que no exista un país con el mismo nombre
    const existingCountryByName = await countriesRepo.findByName(data.name_country);
    if (existingCountryByName) {
      throw new Error(`Ya existe un país con el nombre "${data.name_country}"`);
    }

    return countriesRepo.create(data);
  }

  /**
   * Obtener todos los países
   * Puede filtrar por búsqueda o código
   */
  async getCountries(filters?: { search?: string; code?: string }) {
    return countriesRepo.findAll(filters);
  }

  /**
   * Obtener países con relaciones completas (estados y ciudades)
   */
  async getCountriesWithRelations() {
    return countriesRepo.findAllWithRelations();
  }

  /**
   * Obtener país por ID
   */
  async getCountryById(id: number) {
    const country = await countriesRepo.findById(id);
    if (!country) {
      throw new Error('País no encontrado');
    }
    return country;
  }

  /**
   * Obtener país por código ISO
   */
  async getCountryByCode(code: string) {
    const country = await countriesRepo.findByCode(code);
    if (!country) {
      throw new Error(`País con código "${code}" no encontrado`);
    }
    return country;
  }

  /**
   * Actualizar país
   * Solo PAYPAC puede actualizar
   */
  async updateCountry(
    id: number,
    data: Prisma.CountriesUpdateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar países');
    }

    const country = await countriesRepo.findById(id);
    if (!country) {
      throw new Error('País no encontrado');
    }

    // Si se está cambiando el código ISO, validar que no exista otro país con ese código
    if (data.code && typeof data.code === 'string') {
      const existingCountry = await countriesRepo.findByCode(data.code);
      if (existingCountry && existingCountry.id !== id) {
        throw new Error(`Ya existe otro país con el código ISO "${data.code}"`);
      }
    }

    // Si se está cambiando el nombre, validar que no exista otro país con ese nombre
    if (data.name_country && typeof data.name_country === 'string') {
      const existingCountry = await countriesRepo.findByName(data.name_country);
      if (existingCountry && existingCountry.id !== id) {
        throw new Error(`Ya existe otro país con el nombre "${data.name_country}"`);
      }
    }

    return countriesRepo.update(id, data);
  }

  /**
   * Eliminar país
   * Solo PAYPAC puede eliminar
   */
  async deleteCountry(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar países');
    }

    const country = await countriesRepo.findById(id);
    if (!country) {
      throw new Error('País no encontrado');
    }

    // Verificar que no tenga relaciones activas
    /* 
    if (country.states.length > 0) {
      throw new Error('No se puede eliminar: el país tiene estados asociados');
    }

    if (country.cities.length > 0) {
      throw new Error('No se puede eliminar: el país tiene ciudades asociadas');
    }

    if (country.categories.length > 0) {
      throw new Error('No se puede eliminar: el país tiene categorías asociadas');
    }
*/
    return countriesRepo.delete(id);
  }

  /**
   * Obtener estadísticas de países
   * Solo PAYPAC puede ver estadísticas
   */
  async getCountriesStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const allCountries = await countriesRepo.findAll();
    const totalCount = await countriesRepo.count();

    return {
      total: totalCount,
     // with_states: allCountries.filter(c => c.states.length > 0).length,
     // with_cities: allCountries.filter(c => c.cities.length > 0).length,
     // with_categories: allCountries.filter(c => c.categories.length > 0).length,
    };
  }
}