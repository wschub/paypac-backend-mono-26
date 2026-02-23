import { prisma } from '../config/db';
import { SubCategory, Prisma } from '@prisma/client';

export class SubCategoryRepository {
  /**
   * Crear una nueva subcategoría
   */
  async create(data: Prisma.SubCategoryCreateInput): Promise<SubCategory> {
    return prisma.subCategory.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            country: { select: { id: true, name_country: true, code: true } },
          },
        },
        _count: { select: { subgenres: true, events: true } },
      },
    });
  }

  /**
   * Obtener todas las subcategorías con filtros opcionales
   */
  async findAll(filters?: {
    search?: string;
    category_id?: number;
    country_id?: number;
  }) {
    const where: Prisma.SubCategoryWhereInput = {};

    if (filters?.search) {
      where.subcategory_name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.category_id) {
      where.category_id = filters.category_id;
    }

    // Filtro por país navegando la relación category → country
    if (filters?.country_id) {
      where.category = { country_id: filters.country_id };
    }

    return prisma.subCategory.findMany({
      where,
      orderBy: { subcategory_name: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            country: { select: { id: true, name_country: true, code: true } },
          },
        },
        _count: { select: { subgenres: true, events: true } },
      },
    });
  }

  /**
   * Buscar subcategoría por ID con subgéneros anidados
   */
  async findById(id: number) {
    return prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            country: { select: { id: true, name_country: true, code: true } },
          },
        },
        subgenres: { orderBy: { subcategory_name: 'asc' } },
        _count: { select: { subgenres: true, events: true } },
      },
    });
  }

  /**
   * Subcategorías de una categoría específica
   */
  async findByCategory(category_id: number) {
    return prisma.subCategory.findMany({
      where: { category_id },
      orderBy: { subcategory_name: 'asc' },
      include: {
        subgenres: { orderBy: { subcategory_name: 'asc' } },
        _count: { select: { subgenres: true, events: true } },
      },
    });
  }

  /**
   * Validar nombre único dentro de una categoría
   */
  async findByNameAndCategory(
    subcategory_name: string,
    category_id: number
  ): Promise<SubCategory | null> {
    return prisma.subCategory.findFirst({
      where: {
        subcategory_name: { equals: subcategory_name, mode: 'insensitive' },
        category_id,
      },
    });
  }

  /**
   * Actualizar subcategoría
   */
  async update(id: number, data: Prisma.SubCategoryUpdateInput) {
    return prisma.subCategory.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
            country: { select: { id: true, name_country: true, code: true } },
          },
        },
        _count: { select: { subgenres: true, events: true } },
      },
    });
  }

  /**
   * Eliminar subcategoría
   */
  async delete(id: number): Promise<SubCategory> {
    return prisma.subCategory.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.subCategory.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas de subcategorías
   */
  async getStats(filters?: { category_id?: number; country_id?: number }) {
    const where: Prisma.SubCategoryWhereInput = {};
    if (filters?.category_id) where.category_id = filters.category_id;
    if (filters?.country_id) where.category = { country_id: filters.country_id };

    const [totalSubcategories, totalSubgenres, subcategoriesWithEvents] = await Promise.all([
      prisma.subCategory.count({ where }),
      prisma.subgenre.count({
        where: filters?.category_id
          ? { subcategory: { category_id: filters.category_id } }
          : filters?.country_id
          ? { subcategory: { category: { country_id: filters.country_id } } }
          : undefined,
      }),
      prisma.subCategory.count({
        where: { ...where, events: { some: {} } },
      }),
    ]);

    return {
      total_subcategories: totalSubcategories,
      total_subgenres: totalSubgenres,
      subcategories_with_events: subcategoriesWithEvents,
    };
  }
}