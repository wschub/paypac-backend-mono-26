import { CitiesRepository } from '../repositories/cities.repository';
import { CountriesRepository } from '../repositories/countries.repository';
import { StatesRepository } from '../repositories/states.repository';
import { Prisma } from '@prisma/client';

const citiesRepo = new CitiesRepository();
const countriesRepo = new CountriesRepository();
const statesRepo = new StatesRepository();

export class CitiesService {
  /**
   * Crear una nueva ciudad — solo PAYPAC
   */
  async createCity(
    data: {
      name_city: string;
      state_id: number;
      country_id: number;
      latitude?: string;
      longitude?: string;
    },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear ciudades');
    }

    // Verificar que el país existe
    const country = await countriesRepo.findById(data.country_id);
    if (!country) {
      throw new Error(`El país con ID ${data.country_id} no existe`);
    }

    // Verificar que el estado existe
    const state = await statesRepo.findById(data.state_id);
    if (!state) {
      throw new Error(`El estado con ID ${data.state_id} no existe`);
    }

    // Verificar que el estado pertenece al país
    if (state.country_id !== data.country_id) {
      throw new Error(
        `El estado "${state.name_state}" no pertenece al país indicado`
      );
    }

    // Validar nombre único dentro del estado
    const existing = await citiesRepo.findByNameAndState(data.name_city, data.state_id);
    if (existing) {
      throw new Error(
        `Ya existe la ciudad "${data.name_city}" en el estado "${state.name_state}"`
      );
    }

    return citiesRepo.create({
      name_city: data.name_city,
      latitude: data.latitude ?? '',
      longitude: data.longitude ?? '',
      country: { connect: { id: data.country_id } },
      state: { connect: { id: data.state_id } },
    });
  }

  /**
   * Listar ciudades con filtros — todos los roles autenticados
   */
  async getCities(filters?: {
    search?: string;
    country_id?: number;
    state_id?: number;
  }) {
    return citiesRepo.findAll(filters);
  }

  /**
   * Ciudad por ID — todos los roles autenticados
   */
  async getCityById(id: number) {
    const city = await citiesRepo.findById(id);
    if (!city) {
      throw new Error('Ciudad no encontrada');
    }
    return city;
  }

  /**
   * Ciudades por país directamente, sin pasar por estados — todos los roles
   * Útil para selectores rápidos en el cliente
   */
  async getCitiesByCountry(country_id: number) {
    const country = await countriesRepo.findById(country_id);
    if (!country) {
      throw new Error(`El país con ID ${country_id} no existe`);
    }

    return citiesRepo.findByCountry(country_id);
  }

  /**
   * Ciudades por estado — todos los roles autenticados
   */
  async getCitiesByState(state_id: number) {
    const state = await statesRepo.findById(state_id);
    if (!state) {
      throw new Error(`El estado con ID ${state_id} no existe`);
    }

    return citiesRepo.findByState(state_id);
  }

  /**
   * Actualizar ciudad — solo PAYPAC
   */
  async updateCity(
    id: number,
    data: {
      name_city?: string;
      state_id?: number;
      country_id?: number;
      latitude?: string;
      longitude?: string;
    },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar ciudades');
    }

    const city = await citiesRepo.findById(id);
    if (!city) {
      throw new Error('Ciudad no encontrada');
    }

    const targetStateId = data.state_id ?? city.state_id;
    const targetCountryId = data.country_id ?? city.country_id;

    // Verificar país si se está cambiando
    if (data.country_id && data.country_id !== city.country_id) {
      const country = await countriesRepo.findById(data.country_id);
      if (!country) {
        throw new Error(`El país con ID ${data.country_id} no existe`);
      }
    }

    // Verificar estado si se está cambiando
    if (data.state_id && data.state_id !== city.state_id) {
      const state = await statesRepo.findById(data.state_id);
      if (!state) {
        throw new Error(`El estado con ID ${data.state_id} no existe`);
      }

      // Verificar que el estado pertenece al país destino
      if (state.country_id !== targetCountryId) {
        throw new Error(
          `El estado "${state.name_state}" no pertenece al país indicado`
        );
      }
    }

    // Validar nombre único en el estado destino (excluyendo la ciudad actual)
    if (data.name_city) {
      const existing = await citiesRepo.findByNameAndState(data.name_city, targetStateId);
      if (existing && existing.id !== id) {
        throw new Error(
          `Ya existe la ciudad "${data.name_city}" en el estado con ID ${targetStateId}`
        );
      }
    }

    const updateData: Prisma.CitiesUpdateInput = {};
    if (data.name_city) updateData.name_city = data.name_city;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.state_id) updateData.state = { connect: { id: data.state_id } };
    if (data.country_id) updateData.country = { connect: { id: data.country_id } };

    return citiesRepo.update(id, updateData);
  }

  /**
   * Eliminar ciudad — solo PAYPAC
   */
  async deleteCity(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar ciudades');
    }

    const city = await citiesRepo.findById(id);
    if (!city) {
      throw new Error('Ciudad no encontrada');
    }

    return citiesRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   * Acepta filtros opcionales por country_id o state_id
   */
  async getCitiesStats(
    userRole: string,
    filters?: { country_id?: number; state_id?: number }
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return citiesRepo.getStats(filters);
  }
}