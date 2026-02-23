import { CountriesRepository } from '../repositories/countries.repository';
import { Prisma } from '@prisma/client';

const countriesRepo = new CountriesRepository();

export class CountriesService {
  /**
   * Crear un nuevo país — solo PAYPAC
   */
  async createCountry(data: Prisma.CountriesCreateInput, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear países');
    }

    const existingByCode = await countriesRepo.findByCode(data.code);
    if (existingByCode) {
      throw new Error(`Ya existe un país con el código ISO "${data.code}"`);
    }

    const existingByName = await countriesRepo.findByName(data.name_country);
    if (existingByName) {
      throw new Error(`Ya existe un país con el nombre "${data.name_country}"`);
    }

    return countriesRepo.create(data);
  }

  /**
   * Listar países — todos los roles autenticados
   */
  async getCountries(filters?: { search?: string; code?: string }) {
    return countriesRepo.findAll(filters);
  }

  /**
   * Países con jerarquía completa estados → ciudades — todos los roles
   */
  async getCountriesWithRelations() {
    return countriesRepo.findAllWithRelations();
  }

  /**
   * País por ID — todos los roles autenticados
   */
  async getCountryById(id: number) {
    const country = await countriesRepo.findById(id);
    if (!country) {
      throw new Error('País no encontrado');
    }
    return country;
  }

  /**
   * País por código ISO
   */
  async getCountryByCode(code: string) {
    const country = await countriesRepo.findByCode(code);
    if (!country) {
      throw new Error(`País con código "${code}" no encontrado`);
    }
    return country;
  }

  /**
   * Actualizar país — solo PAYPAC
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

    // Validar código ISO único (excluyendo el país actual)
    if (data.code && typeof data.code === 'string') {
      const existing = await countriesRepo.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe otro país con el código ISO "${data.code}"`);
      }
    }

    // Validar nombre único (excluyendo el país actual)
    if (data.name_country && typeof data.name_country === 'string') {
      const existing = await countriesRepo.findByName(data.name_country);
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe otro país con el nombre "${data.name_country}"`);
      }
    }

    return countriesRepo.update(id, data);
  }

  /**
   * Eliminar país — solo PAYPAC
   * Valida que no tenga estados, ciudades o categorías asociadas
   */
  async deleteCountry(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar países');
    }

    const country = await countriesRepo.findById(id);
    if (!country) {
      throw new Error('País no encontrado');
    }

    // Usa _count que ya viene incluido en findById
    const counts = (country as any)._count;

    if (counts?.states > 0) {
      throw new Error(
        `No se puede eliminar: el país tiene ${counts.states} estado(s) asociado(s). Elimínalos primero.`
      );
    }

    if (counts?.cities > 0) {
      throw new Error(
        `No se puede eliminar: el país tiene ${counts.cities} ciudad(es) asociada(s).`
      );
    }

    if (counts?.categories > 0) {
      throw new Error(
        `No se puede eliminar: el país tiene ${counts.categories} categoría(s) asociada(s).`
      );
    }

    return countriesRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   * Usa agregaciones en DB, no carga registros en memoria
   */
  async getCountriesStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return countriesRepo.getStats();
  }
}