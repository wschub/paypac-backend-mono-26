import { prisma } from '../config/db';
import { Countries, Prisma } from '@prisma/client';

export class CountriesRepository {
  /**
   * Crear un nuevo país
   */
  async create(data: Prisma.CountriesCreateInput): Promise<Countries> {
    return prisma.countries.create({ data });
  }

  /**
   * Obtener todos los países (lista limpia, sin relaciones pesadas)
   * Incluye _count para saber cuántos estados y ciudades tiene cada país
   */
  async findAll(filters?: { search?: string; code?: string }) {
    const where: Prisma.CountriesWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name_country: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.code) {
      where.code = { equals: filters.code, mode: 'insensitive' };
    }

    return prisma.countries.findMany({
      where,
      orderBy: { name_country: 'asc' },
      include: {
        _count: {
          select: {
            states: true,
            cities: true,
            categories: true,
          },
        },
      },
    });
  }

  /**
   * Buscar país por ID con detalle completo
   * Estados incluyen sus ciudades anidadas
   */
  async findById(id: number) {
    return prisma.countries.findUnique({
      where: { id },
      include: {
        states: {
          orderBy: { name_state: 'asc' },
          include: {
            cities: {
              orderBy: { name_city: 'asc' },
            },
          },
        },
        categories: {
          select: {
            id: true,
            category_name: true,
          },
        },
        _count: {
          select: {
            states: true,
            cities: true,
            categories: true,
          },
        },
      },
    });
  }

  /**
   * Buscar país por código ISO
   */
  async findByCode(code: string): Promise<Countries | null> {
    return prisma.countries.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
    });
  }

  /**
   * Buscar país por nombre
   */
  async findByName(name: string): Promise<Countries | null> {
    return prisma.countries.findFirst({
      where: { name_country: { equals: name, mode: 'insensitive' } },
    });
  }

  /**
   * Actualizar país
   */
  async update(id: number, data: Prisma.CountriesUpdateInput) {
    return prisma.countries.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { states: true, cities: true, categories: true },
        },
      },
    });
  }

  /**
   * Eliminar país
   */
  async delete(id: number): Promise<Countries> {
    return prisma.countries.delete({ where: { id } });
  }

  /**
   * Verificar si un país existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.countries.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas globales usando agregaciones de Prisma (no carga registros en memoria)
   */
  async getStats() {
    const [totalCountries, totalStates, totalCities] = await Promise.all([
      prisma.countries.count(),
      prisma.states.count(),
      prisma.cities.count(),
    ]);

    // Países que tienen al menos 1 estado
    const countriesWithStates = await prisma.countries.count({
      where: { states: { some: {} } },
    });

    // Países que tienen al menos 1 categoría
    const countriesWithCategories = await prisma.countries.count({
      where: { categories: { some: {} } },
    });

    return {
      total_countries: totalCountries,
      total_states: totalStates,
      total_cities: totalCities,
      countries_with_states: countriesWithStates,
      countries_with_categories: countriesWithCategories,
    };
  }

  /**
   * Obtener países con jerarquía completa (estados → ciudades)
   */
  async findAllWithRelations() {
    return prisma.countries.findMany({
      orderBy: { name_country: 'asc' },
      include: {
        states: {
          orderBy: { name_state: 'asc' },
          include: {
            cities: {
              orderBy: { name_city: 'asc' },
            },
          },
        },
        _count: {
          select: { states: true, cities: true },
        },
      },
    });
  }
}