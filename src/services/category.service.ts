import { CategoryRepository } from '../repositories/category.repository';
import { CountriesRepository } from '../repositories/countries.repository';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { DEFAULT_COUNTRY_ID } from '../config/constants';

const categoryRepo = new CategoryRepository();
const countriesRepo = new CountriesRepository();

export class CategoryService {
  /**
   * Crear categoría — solo PAYPAC
   */
  async createCategory(
    data: { category_name: string; category_icon?: string; country_id: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear categorías');
    }

    // Verificar que el país existe
    const country = await countriesRepo.findById(data.country_id);
    if (!country) {
      throw new Error(`El país con ID ${data.country_id} no existe`);
    }

    // Validar nombre único dentro del país
    const existing = await categoryRepo.findByNameAndCountry(
      data.category_name,
      data.country_id
    );
    if (existing) {
      throw new Error(
        `Ya existe la categoría "${data.category_name}" en ${(country as any).name_country}`
      );
    }

    return categoryRepo.create({
      category_name: data.category_name,
      category_icon: data.category_icon,
      country: { connect: { id: data.country_id } },
    });
  }

  /**
   * Listar categorías con filtros — todos los roles autenticados
   */
  async getCategories(filters?: { search?: string; country_id?: number }) {
    return categoryRepo.findAll(filters);
  }

  /**
   * Categoría por ID con jerarquía completa — todos los roles
   */
  async getCategoryById(id: number) {
    const category = await categoryRepo.findById(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }
    return category;
  }

  /**
   * Categorías de un país con su jerarquía completa — todos los roles
   */
  async getCategoriesByCountry(country_id: number) {
    const country = await countriesRepo.findById(country_id);
    if (!country) {
      throw new Error(`El país con ID ${country_id} no existe`);
    }

    return categoryRepo.findByCountry(country_id);
  }

  /**
   * Actualizar categoría — solo PAYPAC
   */
  async updateCategory(
    id: number,
    data: { category_name?: string; category_icon?: string; country_id?: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar categorías');
    }

    const category = await categoryRepo.findById(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    const targetCountryId = data.country_id ?? category.country_id;

    // Verificar que el país destino existe si se está cambiando
    if (data.country_id && data.country_id !== category.country_id) {
      const country = await countriesRepo.findById(data.country_id);
      if (!country) {
        throw new Error(`El país con ID ${data.country_id} no existe`);
      }
    }

    // Validar nombre único en el país destino (excluyendo la categoría actual)
    if (data.category_name) {
      const existing = await categoryRepo.findByNameAndCountry(
        data.category_name,
        targetCountryId
      );
      if (existing && existing.id !== id) {
        throw new Error(
          `Ya existe la categoría "${data.category_name}" en el país con ID ${targetCountryId}`
        );
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};
    if (data.category_name) updateData.category_name = data.category_name;
    if (data.category_icon !== undefined) updateData.category_icon = data.category_icon;
    if (data.country_id) updateData.country = { connect: { id: data.country_id } };

    return categoryRepo.update(id, updateData);
  }

  /**
   * Eliminar categoría — solo PAYPAC
   * Valida que no tenga subcategorías ni eventos asociados
   */
  async deleteCategory(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar categorías');
    }

    const category = await categoryRepo.findById(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    const counts = (category as any)._count;

    if (counts?.subcategories > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${counts.subcategories} subcategoría(s) asociada(s). Elimínalas primero.`
      );
    }

    if (counts?.events > 0) {
      throw new Error(
        `No se puede eliminar: la categoría tiene ${counts.events} evento(s) asociado(s).`
      );
    }

    return categoryRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   */
  async getCategoriesStats(userRole: string, country_id?: number) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return categoryRepo.getStats(country_id);
  }

  async getPublicCategories(filters: { search?: string; country_id?: string }) {
    const countryId = filters.country_id ? parseInt(filters.country_id) : DEFAULT_COUNTRY_ID;

    const categories = await prisma.category.findMany({
      where: {
        country_id: countryId,
        ...(filters.search && {
          category_name: { contains: filters.search, mode: 'insensitive' },
        }),
      },
      select: {
        id: true,
        category_name: true,
        category_icon: true,
        country_id: true,
        _count: {
          select: {
            events: { where: { status: { in: ['APPROVED', 'ACTIVE'] }, event_type: 'PUBLICO' } },
          },
        },
      },
      orderBy: { category_name: 'asc' },
    });

    return { data: categories, total: categories.length };
  }
}