import { prisma } from '../config/db';
import { CardFranchiseFee, Prisma } from '@prisma/client';

export class CardFranchiseFeeRepository {
  /**
   * Crear una nueva franquicia
   */
  async create(data: Prisma.CardFranchiseFeeCreateInput): Promise<CardFranchiseFee> {
    return prisma.cardFranchiseFee.create({ data });
  }

  /**
   * Listar todas las franquicias, con filtro opcional por is_active
   */
  async findAll(filters?: { is_active?: boolean }): Promise<CardFranchiseFee[]> {
    const where: Prisma.CardFranchiseFeeWhereInput = {};

    if (filters?.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    return prisma.cardFranchiseFee.findMany({
      where,
      orderBy: { franchise: 'asc' },
    });
  }

  /**
   * Buscar franquicia por ID
   */
  async findById(id: number): Promise<CardFranchiseFee | null> {
    return prisma.cardFranchiseFee.findUnique({ where: { id } });
  }

  /**
   * Buscar franquicia por nombre (única)
   */
  async findByFranchise(franchise: string): Promise<CardFranchiseFee | null> {
    return prisma.cardFranchiseFee.findUnique({ where: { franchise } });
  }

  /**
   * Actualizar franquicia
   */
  async update(id: number, data: Prisma.CardFranchiseFeeUpdateInput): Promise<CardFranchiseFee> {
    return prisma.cardFranchiseFee.update({ where: { id }, data });
  }

  /**
   * Eliminar franquicia
   */
  async delete(id: number): Promise<CardFranchiseFee> {
    return prisma.cardFranchiseFee.delete({ where: { id } });
  }

  /**
   * Verificar si existe por ID
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.cardFranchiseFee.count({ where: { id } });
    return count > 0;
  }
}
