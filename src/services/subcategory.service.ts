import { SubCategoryRepository } from '../repositories/subcategory.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';

const subCategoryRepo = new SubCategoryRepository();
const categoryRepo = new CategoryRepository();

export class SubCategoryService {
  /**
   * Crear subcategoría — solo PAYPAC
   */
  async createSubCategory(
    data: { subcategory_name: string; category_id: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear subcategorías');
    }

    // Verificar que la categoría existe
    const category = await categoryRepo.findById(data.category_id);
    if (!category) {
      throw new Error(`La categoría con ID ${data.category_id} no existe`);
    }

    // Validar nombre único dentro de la categoría
    const existing = await subCategoryRepo.findByNameAndCategory(
      data.subcategory_name,
      data.category_id
    );
    if (existing) {
      throw new Error(
        `Ya existe la subcategoría "${data.subcategory_name}" en la categoría "${category.category_name}"`
      );
    }

    return subCategoryRepo.create({
      subcategory_name: data.subcategory_name,
      category: { connect: { id: data.category_id } },
    });
  }

  /**
   * Listar subcategorías con filtros — todos los roles autenticados
   */
  async getSubCategories(filters?: {
    search?: string;
    category_id?: number;
    country_id?: number;
  }) {
    return subCategoryRepo.findAll(filters);
  }

  /**
   * Subcategoría por ID con subgéneros — todos los roles
   */
  async getSubCategoryById(id: number) {
    const subcategory = await subCategoryRepo.findById(id);
    if (!subcategory) {
      throw new Error('Subcategoría no encontrada');
    }
    return subcategory;
  }

  /**
   * Subcategorías de una categoría — todos los roles
   */
  async getSubCategoriesByCategory(category_id: number) {
    const category = await categoryRepo.findById(category_id);
    if (!category) {
      throw new Error(`La categoría con ID ${category_id} no existe`);
    }

    return subCategoryRepo.findByCategory(category_id);
  }

  /**
   * Actualizar subcategoría — solo PAYPAC
   */
  async updateSubCategory(
    id: number,
    data: { subcategory_name?: string; category_id?: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar subcategorías');
    }

    const subcategory = await subCategoryRepo.findById(id);
    if (!subcategory) {
      throw new Error('Subcategoría no encontrada');
    }

    const targetCategoryId = data.category_id ?? subcategory.category_id;

    // Verificar que la categoría destino existe si se está cambiando
    if (data.category_id && data.category_id !== subcategory.category_id) {
      const category = await categoryRepo.findById(data.category_id);
      if (!category) {
        throw new Error(`La categoría con ID ${data.category_id} no existe`);
      }
    }

    // Validar nombre único en la categoría destino (excluyendo la actual)
    if (data.subcategory_name) {
      const existing = await subCategoryRepo.findByNameAndCategory(
        data.subcategory_name,
        targetCategoryId
      );
      if (existing && existing.id !== id) {
        throw new Error(
          `Ya existe la subcategoría "${data.subcategory_name}" en la categoría con ID ${targetCategoryId}`
        );
      }
    }

    const updateData: Prisma.SubCategoryUpdateInput = {};
    if (data.subcategory_name) updateData.subcategory_name = data.subcategory_name;
    if (data.category_id) updateData.category = { connect: { id: data.category_id } };

    return subCategoryRepo.update(id, updateData);
  }

  /**
   * Eliminar subcategoría — solo PAYPAC
   * Valida que no tenga subgéneros ni eventos asociados
   */
  async deleteSubCategory(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar subcategorías');
    }

    const subcategory = await subCategoryRepo.findById(id);
    if (!subcategory) {
      throw new Error('Subcategoría no encontrada');
    }

    const counts = (subcategory as any)._count;

    if (counts?.subgenres > 0) {
      throw new Error(
        `No se puede eliminar: la subcategoría tiene ${counts.subgenres} subgénero(s) asociado(s). Elimínalos primero.`
      );
    }

    if (counts?.events > 0) {
      throw new Error(
        `No se puede eliminar: la subcategoría tiene ${counts.events} evento(s) asociado(s).`
      );
    }

    return subCategoryRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   */
  async getSubCategoriesStats(
    userRole: string,
    filters?: { category_id?: number; country_id?: number }
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return subCategoryRepo.getStats(filters);
  }

  async getPublicSubcategories(categoryId: number) {
    const subcategories = await prisma.subCategory.findMany({
      where: {
        category_id: categoryId,
        events: {
          some: {
            status: { in: ['APPROVED', 'ACTIVE'] },
            event_type: 'PUBLICO',
          },
        },
      },
      select: {
        id: true,
        category_id: true,
        subcategory_name: true,
        createdAt: true,
      } as any,
      orderBy: { subcategory_name: 'asc' },
    });

    return { data: subcategories, total: subcategories.length };
  }
}