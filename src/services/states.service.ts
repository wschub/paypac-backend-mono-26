import { StatesRepository } from '../repositories/states.repository';
import { CountriesRepository } from '../repositories/countries.repository';
import { Prisma } from '@prisma/client';

const statesRepo = new StatesRepository();
const countriesRepo = new CountriesRepository();

export class StatesService {
  /**
   * Crear un nuevo estado — solo PAYPAC
   */
  async createState(
    data: { name_state: string; country_id: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear estados');
    }

    // Verificar que el país existe
    const country = await countriesRepo.findById(data.country_id);
    if (!country) {
      throw new Error(`El país con ID ${data.country_id} no existe`);
    }

    // Validar nombre único dentro del país
    const existing = await statesRepo.findByNameAndCountry(data.name_state, data.country_id);
    if (existing) {
      throw new Error(
        `Ya existe el estado "${data.name_state}" en ${(country as any).name_country}`
      );
    }

    return statesRepo.create({
      name_state: data.name_state,
      country: { connect: { id: data.country_id } },
    });
  }

  /**
   * Listar estados — todos los roles autenticados
   */
  async getStates(filters?: { search?: string; country_id?: number }) {
    return statesRepo.findAll(filters);
  }

  /**
   * Estado por ID — todos los roles autenticados
   */
  async getStateById(id: number) {
    const state = await statesRepo.findById(id);
    if (!state) {
      throw new Error('Estado no encontrado');
    }
    return state;
  }

  /**
   * Estados de un país específico — todos los roles autenticados
   */
  async getStatesByCountry(country_id: number) {
    // Verificar que el país existe
    const country = await countriesRepo.findById(country_id);
    if (!country) {
      throw new Error(`El país con ID ${country_id} no existe`);
    }

    return statesRepo.findByCountry(country_id);
  }

  /**
   * Actualizar estado — solo PAYPAC
   */
  async updateState(
    id: number,
    data: { name_state?: string; country_id?: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar estados');
    }

    const state = await statesRepo.findById(id);
    if (!state) {
      throw new Error('Estado no encontrado');
    }

    // Si se cambia el país, verificar que exista
    const targetCountryId = data.country_id ?? state.country_id;
    if (data.country_id && data.country_id !== state.country_id) {
      const country = await countriesRepo.findById(data.country_id);
      if (!country) {
        throw new Error(`El país con ID ${data.country_id} no existe`);
      }
    }

    // Si se cambia el nombre, validar unicidad en el país destino
    if (data.name_state) {
      const existing = await statesRepo.findByNameAndCountry(data.name_state, targetCountryId);
      if (existing && existing.id !== id) {
        throw new Error(
          `Ya existe el estado "${data.name_state}" en el país con ID ${targetCountryId}`
        );
      }
    }

    const updateData: Prisma.StatesUpdateInput = {};
    if (data.name_state) updateData.name_state = data.name_state;
    if (data.country_id) updateData.country = { connect: { id: data.country_id } };

    return statesRepo.update(id, updateData);
  }

  /**
   * Eliminar estado — solo PAYPAC
   * Valida que no tenga ciudades asociadas
   */
  async deleteState(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar estados');
    }

    const state = await statesRepo.findById(id);
    if (!state) {
      throw new Error('Estado no encontrado');
    }

    const counts = (state as any)._count;
    if (counts?.cities > 0) {
      throw new Error(
        `No se puede eliminar: el estado tiene ${counts.cities} ciudad(es) asociada(s). Elimínalas primero.`
      );
    }

    return statesRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   * Acepta filtro opcional por country_id
   */
  async getStatesStats(userRole: string, country_id?: number) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return statesRepo.getStats(country_id);
  }
}