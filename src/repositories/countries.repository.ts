import { prisma } from '../config/db';
import { Countries, Prisma } from '@prisma/client';

export class CountriesRepository {
  /**
   * Crear un nuevo país
   */
  async create(data: Prisma.CountriesCreateInput): Promise<Countries> {
    return prisma.countries.create({
      data,
    });
  }

  /**
   * Obtener todos los países
   */
  async findAll(filters?: { search?: string; code?: string }): Promise<Countries[]> {
    const where: Prisma.CountriesWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name_country: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.code) {
      where.code = filters.code;
    }

    return prisma.countries.findMany({
      where,
      include: {
        states: true,
        cities: true,
        categories: true,
      },
      orderBy: { name_country: 'asc' },
    });
  }

  /**
   * Buscar país por ID
   */
  async findById(id: number): Promise<Countries | null> {
    return prisma.countries.findUnique({
      where: { id },
      include: {
        states: true,
        cities: true,
        categories: true,
      },
    });
  }

  /**
   * Buscar país por código ISO
   */
  async findByCode(code: string): Promise<Countries | null> {
    return prisma.countries.findFirst({
      where: { code },
    });
  }

  /**
   * Buscar país por nombre
   */
  async findByName(name: string): Promise<Countries | null> {
    return prisma.countries.findFirst({
      where: {
        name_country: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Actualizar país
   */
  async update(id: number, data: Prisma.CountriesUpdateInput): Promise<Countries> {
    return prisma.countries.update({
      where: { id },
      data,
      include: {
        states: true,
        cities: true,
        categories: true,
      },
    });
  }

  /**
   * Eliminar país
   */
  async delete(id: number): Promise<Countries> {
    return prisma.countries.delete({
      where: { id },
    });
  }

  /**
   * Verificar si un país existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.countries.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar total de países
   */
  async count(): Promise<number> {
    return prisma.countries.count();
  }

  /**
   * Obtener países con sus estados y ciudades
   */
  async findAllWithRelations(): Promise<Countries[]> {
    return prisma.countries.findMany({
      include: {
        states: {
          include: {
            cities: true,
          },
        },
      },
      orderBy: { name_country: 'asc' },
    });
  }
}