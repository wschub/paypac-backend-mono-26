import { SubgenreRepository } from '../repositories/subgenre.repository';
import { SubCategoryRepository } from '../repositories/subcategory.repository';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';

const subgenreRepo = new SubgenreRepository();
const subCategoryRepo = new SubCategoryRepository();

export class SubgenreService {
  /**
   * Crear subgénero — solo PAYPAC
   */
  async createSubgenre(
    data: { subcategory_name: string; subcategory_id: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear subgéneros');
    }

    // Verificar que la subcategoría existe
    const subcategory = await subCategoryRepo.findById(data.subcategory_id);
    if (!subcategory) {
      throw new Error(`La subcategoría con ID ${data.subcategory_id} no existe`);
    }

    // Validar nombre único dentro de la subcategoría
    const existing = await subgenreRepo.findByNameAndSubCategory(
      data.subcategory_name,
      data.subcategory_id
    );
    if (existing) {
      throw new Error(
        `Ya existe el subgénero "${data.subcategory_name}" en la subcategoría "${subcategory.subcategory_name}"`
      );
    }

    return subgenreRepo.create({
      subcategory_name: data.subcategory_name,
      subcategory: { connect: { id: data.subcategory_id } },
    });
  }

  /**
   * Listar subgéneros con filtros — todos los roles autenticados
   */
  async getSubgenres(filters?: {
    search?: string;
    subcategory_id?: number;
    category_id?: number;
    country_id?: number;
  }) {
    return subgenreRepo.findAll(filters);
  }

  /**
   * Subgénero por ID — todos los roles
   */
  async getSubgenreById(id: number) {
    const subgenre = await subgenreRepo.findById(id);
    if (!subgenre) {
      throw new Error('Subgénero no encontrado');
    }
    return subgenre;
  }

  /**
   * Subgéneros de una subcategoría — todos los roles
   */
  async getSubgenresBySubCategory(subcategory_id: number) {
    const subcategory = await subCategoryRepo.findById(subcategory_id);
    if (!subcategory) {
      throw new Error(`La subcategoría con ID ${subcategory_id} no existe`);
    }

    return subgenreRepo.findBySubCategory(subcategory_id);
  }

  /**
   * Actualizar subgénero — solo PAYPAC
   */
  async updateSubgenre(
    id: number,
    data: { subcategory_name?: string; subcategory_id?: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar subgéneros');
    }

    const subgenre = await subgenreRepo.findById(id);
    if (!subgenre) {
      throw new Error('Subgénero no encontrado');
    }

    const targetSubcategoryId = data.subcategory_id ?? subgenre.subcategory_id;

    // Verificar subcategoría destino si se está cambiando
    if (data.subcategory_id && data.subcategory_id !== subgenre.subcategory_id) {
      const subcategory = await subCategoryRepo.findById(data.subcategory_id);
      if (!subcategory) {
        throw new Error(`La subcategoría con ID ${data.subcategory_id} no existe`);
      }
    }

    // Validar nombre único en la subcategoría destino (excluyendo el actual)
    if (data.subcategory_name) {
      const existing = await subgenreRepo.findByNameAndSubCategory(
        data.subcategory_name,
        targetSubcategoryId
      );
      if (existing && existing.id !== id) {
        throw new Error(
          `Ya existe el subgénero "${data.subcategory_name}" en la subcategoría con ID ${targetSubcategoryId}`
        );
      }
    }

    const updateData: Prisma.SubgenreUpdateInput = {};
    if (data.subcategory_name) updateData.subcategory_name = data.subcategory_name;
    if (data.subcategory_id) updateData.subcategory = { connect: { id: data.subcategory_id } };

    return subgenreRepo.update(id, updateData);
  }

  /**
   * Eliminar subgénero — solo PAYPAC
   * Valida que no tenga eventos asociados
   */
  async deleteSubgenre(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar subgéneros');
    }

    const subgenre = await subgenreRepo.findById(id);
    if (!subgenre) {
      throw new Error('Subgénero no encontrado');
    }

    const counts = (subgenre as any)._count;
    if (counts?.events > 0) {
      throw new Error(
        `No se puede eliminar: el subgénero tiene ${counts.events} evento(s) asociado(s).`
      );
    }

    return subgenreRepo.delete(id);
  }

  /**
   * Estadísticas — solo PAYPAC
   */
  async getSubgenresStats(
    userRole: string,
    filters?: { subcategory_id?: number; category_id?: number; country_id?: number }
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    return subgenreRepo.getStats(filters);
  }

  async getPublicSubgenres(filters: {
    search?: string;
    subcategory_id?: string;
    category_id?: string;
  }) {
    const subcategoryId = filters.subcategory_id
      ? parseInt(filters.subcategory_id)
      : undefined;
    const categoryId = filters.category_id
      ? parseInt(filters.category_id)
      : undefined;

    const where: any = {
      events: {
        some: {
          status: { in: ['APPROVED', 'ACTIVE'] },
          event_type: 'PUBLICO',
        },
      },
      ...(filters.search && {
        subcategory_name: { contains: filters.search, mode: 'insensitive' },
      }),
      ...(subcategoryId && { subcategory_id: subcategoryId }),
      ...(categoryId && { subcategory: { category_id: categoryId } }),
    };

    const subgenres = await prisma.subgenre.findMany({
      where,
      select: {
        id: true,
        subcategory_id: true,
        subcategory_name: true,
        createdAt: true,
      } as any,
      orderBy: { subcategory_name: 'asc' },
    });

    return { data: subgenres, total: subgenres.length };
  }
}