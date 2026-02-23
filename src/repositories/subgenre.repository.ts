import { prisma } from '../config/db';
import { Subgenre, Prisma } from '@prisma/client';

export class SubgenreRepository {
  /**
   * Crear un nuevo subgénero
   */
  async create(data: Prisma.SubgenreCreateInput): Promise<Subgenre> {
    return prisma.subgenre.create({
      data,
      include: {
        subcategory: {
          select: {
            id: true,
            subcategory_name: true,
            category: {
              select: {
                id: true,
                category_name: true,
                country: { select: { id: true, name_country: true, code: true } },
              },
            },
          },
        },
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * Obtener todos los subgéneros con filtros opcionales
   */
  async findAll(filters?: {
    search?: string;
    subcategory_id?: number;
    category_id?: number;
    country_id?: number;
  }) {
    const where: Prisma.SubgenreWhereInput = {};

    if (filters?.search) {
      where.subcategory_name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.subcategory_id) {
      where.subcategory_id = filters.subcategory_id;
    }

    // Navega subcategory → category
    if (filters?.category_id) {
      where.subcategory = { category_id: filters.category_id };
    }

    // Navega subcategory → category → country
    if (filters?.country_id) {
      where.subcategory = { category: { country_id: filters.country_id } };
    }

    return prisma.subgenre.findMany({
      where,
      orderBy: { subcategory_name: 'asc' },
      include: {
        subcategory: {
          select: {
            id: true,
            subcategory_name: true,
            category: {
              select: {
                id: true,
                category_name: true,
                country: { select: { id: true, name_country: true, code: true } },
              },
            },
          },
        },
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * Buscar subgénero por ID
   */
  async findById(id: number) {
    return prisma.subgenre.findUnique({
      where: { id },
      include: {
        subcategory: {
          select: {
            id: true,
            subcategory_name: true,
            category: {
              select: {
                id: true,
                category_name: true,
                country: { select: { id: true, name_country: true, code: true } },
              },
            },
          },
        },
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * Subgéneros de una subcategoría específica
   */
  async findBySubCategory(subcategory_id: number) {
    return prisma.subgenre.findMany({
      where: { subcategory_id },
      orderBy: { subcategory_name: 'asc' },
      include: {
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * Validar nombre único dentro de una subcategoría
   */
  async findByNameAndSubCategory(
    name: string,
    subcategory_id: number
  ): Promise<Subgenre | null> {
    return prisma.subgenre.findFirst({
      where: {
        subcategory_name: { equals: name, mode: 'insensitive' },
        subcategory_id,
      },
    });
  }

  /**
   * Actualizar subgénero
   */
  async update(id: number, data: Prisma.SubgenreUpdateInput) {
    return prisma.subgenre.update({
      where: { id },
      data,
      include: {
        subcategory: {
          select: {
            id: true,
            subcategory_name: true,
            category: {
              select: {
                id: true,
                category_name: true,
                country: { select: { id: true, name_country: true, code: true } },
              },
            },
          },
        },
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * Eliminar subgénero
   */
  async delete(id: number): Promise<Subgenre> {
    return prisma.subgenre.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.subgenre.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas de subgéneros
   */
  async getStats(filters?: {
    subcategory_id?: number;
    category_id?: number;
    country_id?: number;
  }) {
    const where: Prisma.SubgenreWhereInput = {};

    if (filters?.subcategory_id) {
      where.subcategory_id = filters.subcategory_id;
    } else if (filters?.category_id) {
      where.subcategory = { category_id: filters.category_id };
    } else if (filters?.country_id) {
      where.subcategory = { category: { country_id: filters.country_id } };
    }

    const [totalSubgenres, subgenresWithEvents] = await Promise.all([
      prisma.subgenre.count({ where }),
      prisma.subgenre.count({
        where: { ...where, events: { some: {} } },
      }),
    ]);

    return {
      total_subgenres: totalSubgenres,
      subgenres_with_events: subgenresWithEvents,
    };
  }
}