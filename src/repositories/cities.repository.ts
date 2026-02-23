import { prisma } from '../config/db';
import { Cities, Prisma } from '@prisma/client';

export class CitiesRepository {
  /**
   * Crear una nueva ciudad
   */
  async create(data: Prisma.CitiesCreateInput): Promise<Cities> {
    return prisma.cities.create({
      data,
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Obtener todas las ciudades con filtros opcionales
   */
  async findAll(filters?: {
    search?: string;
    country_id?: number;
    state_id?: number;
  }) {
    const where: Prisma.CitiesWhereInput = {};

    if (filters?.search) {
      where.name_city = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.country_id) {
      where.country_id = filters.country_id;
    }

    if (filters?.state_id) {
      where.state_id = filters.state_id;
    }

    return prisma.cities.findMany({
      where,
      orderBy: { name_city: 'asc' },
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Buscar ciudad por ID
   */
  async findById(id: number) {
    return prisma.cities.findUnique({
      where: { id },
      include: {
        country: { select: { id: true, name_country: true, code: true, currency: true } },
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Ciudades por país directamente (sin pasar por estados)
   * Usa country_id que existe como FK directo en Cities
   */
  async findByCountry(country_id: number) {
    return prisma.cities.findMany({
      where: { country_id },
      orderBy: [{ state_id: 'asc' }, { name_city: 'asc' }],
      include: {
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Ciudades por estado
   */
  async findByState(state_id: number) {
    return prisma.cities.findMany({
      where: { state_id },
      orderBy: { name_city: 'asc' },
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Buscar ciudad por nombre dentro de un estado (para validar duplicados)
   */
  async findByNameAndState(name_city: string, state_id: number): Promise<Cities | null> {
    return prisma.cities.findFirst({
      where: {
        name_city: { equals: name_city, mode: 'insensitive' },
        state_id,
      },
    });
  }

  /**
   * Actualizar ciudad
   */
  async update(id: number, data: Prisma.CitiesUpdateInput) {
    return prisma.cities.update({
      where: { id },
      data,
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        state: { select: { id: true, name_state: true } },
      },
    });
  }

  /**
   * Eliminar ciudad
   */
  async delete(id: number): Promise<Cities> {
    return prisma.cities.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.cities.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas de ciudades
   */
  async getStats(filters?: { country_id?: number; state_id?: number }) {
    const where: Prisma.CitiesWhereInput = {};
    if (filters?.country_id) where.country_id = filters.country_id;
    if (filters?.state_id) where.state_id = filters.state_id;

    const total = await prisma.cities.count({ where });

    return { total_cities: total };
  }
}