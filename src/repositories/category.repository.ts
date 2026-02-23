import { prisma } from '../config/db';
import { Category, Prisma } from '@prisma/client';

export class CategoryRepository {
  /**
   * Crear una nueva categoría
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        _count: { select: { subcategories: true, events: true } },
      },
    });
  }

  /**
   * Obtener todas las categorías con filtros opcionales
   */
  async findAll(filters?: { search?: string; country_id?: number }) {
    const where: Prisma.CategoryWhereInput = {};

    if (filters?.search) {
      where.category_name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters?.country_id) {
      where.country_id = filters.country_id;
    }

    return prisma.category.findMany({
      where,
      orderBy: { category_name: 'asc' },
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        _count: { select: { subcategories: true, events: true } },
      },
    });
  }

  /**
   * Buscar categoría por ID con subcategorías y subgéneros anidados
   */
  async findById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        subcategories: {
          orderBy: { subcategory_name: 'asc' },
          include: {
            subgenres: { orderBy: { subcategory_name: 'asc' } },
            _count: { select: { events: true, subgenres: true } },
          },
        },
        _count: { select: { subcategories: true, events: true } },
      },
    });
  }

  /**
   * Categorías por país
   */
  async findByCountry(country_id: number) {
    return prisma.category.findMany({
      where: { country_id },
      orderBy: { category_name: 'asc' },
      include: {
        subcategories: {
          orderBy: { subcategory_name: 'asc' },
          include: {
            subgenres: { orderBy: { subcategory_name: 'asc' } },
            _count: { select: { events: true } },
          },
        },
        _count: { select: { subcategories: true, events: true } },
      },
    });
  }

  /**
   * Validar nombre único dentro de un país
   */
  async findByNameAndCountry(
    category_name: string,
    country_id: number
  ): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        category_name: { equals: category_name, mode: 'insensitive' },
        country_id,
      },
    });
  }

  /**
   * Actualizar categoría
   */
  async update(id: number, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        country: { select: { id: true, name_country: true, code: true } },
        _count: { select: { subcategories: true, events: true } },
      },
    });
  }

  /**
   * Eliminar categoría
   */
  async delete(id: number): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.category.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas globales o por país
   */
  async getStats(country_id?: number) {
    const categoryWhere: Prisma.CategoryWhereInput = country_id ? { country_id } : {};

    const [totalCategories, totalSubcategories, categoriesWithEvents] = await Promise.all([
      prisma.category.count({ where: categoryWhere }),
      prisma.subCategory.count({
        where: country_id ? { category: { country_id } } : undefined,
      }),
      prisma.category.count({
        where: { ...categoryWhere, events: { some: {} } },
      }),
    ]);

    return {
      total_categories: totalCategories,
      total_subcategories: totalSubcategories,
      categories_with_events: categoriesWithEvents,
    };
  }
}