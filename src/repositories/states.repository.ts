import { prisma } from '../config/db';
import { States, Prisma } from '@prisma/client';

export class StatesRepository {
  /**
   * Crear un nuevo estado
   */
  async create(data: Prisma.StatesCreateInput): Promise<States> {
    return prisma.states.create({ data });
  }

  /**
   * Obtener todos los estados con _count de ciudades
   */
  async findAll(filters?: { search?: string; country_id?: number }) {
    const where: Prisma.StatesWhereInput = {};

    if (filters?.search) {
      where.name_state = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.country_id) {
      where.country_id = filters.country_id;
    }

    return prisma.states.findMany({
      where,
      orderBy: { name_state: 'asc' },
      include: {
        country: {
          select: { id: true, name_country: true, code: true },
        },
        _count: {
          select: { cities: true },
        },
      },
    });
  }

  /**
   * Buscar estado por ID con ciudades incluidas
   */
  async findById(id: number) {
    return prisma.states.findUnique({
      where: { id },
      include: {
        country: {
          select: { id: true, name_country: true, code: true, currency: true },
        },
        cities: {
          orderBy: { name_city: 'asc' },
        },
        _count: {
          select: { cities: true },
        },
      },
    });
  }

  /**
   * Buscar estados por país
   */
  async findByCountry(country_id: number) {
    return prisma.states.findMany({
      where: { country_id },
      orderBy: { name_state: 'asc' },
      include: {
        cities: {
          orderBy: { name_city: 'asc' },
        },
        _count: {
          select: { cities: true },
        },
      },
    });
  }

  /**
   * Buscar estado por nombre dentro de un país (para validar duplicados)
   */
  async findByNameAndCountry(name_state: string, country_id: number): Promise<States | null> {
    return prisma.states.findFirst({
      where: {
        name_state: { equals: name_state, mode: 'insensitive' },
        country_id,
      },
    });
  }

  /**
   * Actualizar estado
   */
  async update(id: number, data: Prisma.StatesUpdateInput) {
    return prisma.states.update({
      where: { id },
      data,
      include: {
        country: {
          select: { id: true, name_country: true, code: true },
        },
        _count: {
          select: { cities: true },
        },
      },
    });
  }

  /**
   * Eliminar estado
   */
  async delete(id: number): Promise<States> {
    return prisma.states.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.states.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas de estados
   */
  async getStats(country_id?: number) {
    const where = country_id ? { country_id } : {};

    const [totalStates, totalCities, statesWithCities] = await Promise.all([
      prisma.states.count({ where }),
      prisma.cities.count({ where: country_id ? { country_id } : {} }),
      prisma.states.count({
        where: { ...where, cities: { some: {} } },
      }),
    ]);

    return {
      total_states: totalStates,
      total_cities: totalCities,
      states_with_cities: statesWithCities,
      states_without_cities: totalStates - statesWithCities,
    };
  }
}