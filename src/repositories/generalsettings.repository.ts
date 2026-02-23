import { prisma } from '../config/db';
import { GeneralSettingsVariables, Prisma } from '@prisma/client';

export class GeneralSettingsRepository {
  /**
   * Crear una nueva variable
   */
  async create(data: Prisma.GeneralSettingsVariablesCreateInput): Promise<GeneralSettingsVariables> {
    return prisma.generalSettingsVariables.create({ data });
  }

  /**
   * Obtener todas las variables con filtro opcional
   */
  async findAll(filters?: { search?: string }) {
    const where: Prisma.GeneralSettingsVariablesWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.generalSettingsVariables.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Buscar variable por ID
   */
  async findById(id: number): Promise<GeneralSettingsVariables | null> {
    return prisma.generalSettingsVariables.findUnique({ where: { id } });
  }

  /**
   * Buscar variable por nombre (único)
   */
  async findByName(name: string): Promise<GeneralSettingsVariables | null> {
    return prisma.generalSettingsVariables.findUnique({ where: { name } });
  }

  /**
   * Actualizar variable
   */
  async update(
    id: number,
    data: Prisma.GeneralSettingsVariablesUpdateInput
  ): Promise<GeneralSettingsVariables> {
    return prisma.generalSettingsVariables.update({ where: { id }, data });
  }

  /**
   * Eliminar variable
   */
  async delete(id: number): Promise<GeneralSettingsVariables> {
    return prisma.generalSettingsVariables.delete({ where: { id } });
  }

  /**
   * Verificar si existe por ID
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.generalSettingsVariables.count({ where: { id } });
    return count > 0;
  }
}