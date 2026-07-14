import { CardFranchiseFeeRepository } from '../repositories/card_franchise_fee.repository';
import { Prisma } from '@prisma/client';

const franchiseFeeRepo = new CardFranchiseFeeRepository();

export class CardFranchiseFeeService {
  /**
   * Crear franquicia — solo PAYPAC
   */
  async createFranchiseFee(
    data: { franchise: string; commission_pct: number; commission_amount?: number; is_active?: boolean },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear comisiones por franquicia');
    }

    const existing = await franchiseFeeRepo.findByFranchise(data.franchise);
    if (existing) {
      throw new Error(`Ya existe una franquicia con el nombre "${data.franchise}"`);
    }

    return franchiseFeeRepo.create({
      franchise: data.franchise,
      commission_pct: data.commission_pct,
      commission_amount: data.commission_amount ?? 0,
      is_active: data.is_active ?? true,
    });
  }

  /**
   * Listar franquicias — solo PAYPAC
   */
  async getFranchiseFees(userRole: string, filters?: { is_active?: boolean }) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver las comisiones por franquicia');
    }

    return franchiseFeeRepo.findAll(filters);
  }

  /**
   * Franquicia por ID — solo PAYPAC
   */
  async getFranchiseFeeById(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver las comisiones por franquicia');
    }

    const franchiseFee = await franchiseFeeRepo.findById(id);
    if (!franchiseFee) {
      throw new Error('Franquicia no encontrada');
    }
    return franchiseFee;
  }

  /**
   * Actualizar franquicia — solo PAYPAC
   */
  async updateFranchiseFee(
    id: number,
    data: { franchise?: string; commission_pct?: number; commission_amount?: number; is_active?: boolean },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar comisiones por franquicia');
    }

    const franchiseFee = await franchiseFeeRepo.findById(id);
    if (!franchiseFee) {
      throw new Error('Franquicia no encontrada');
    }

    if (data.franchise && data.franchise !== franchiseFee.franchise) {
      const existing = await franchiseFeeRepo.findByFranchise(data.franchise);
      if (existing) {
        throw new Error(`Ya existe otra franquicia con el nombre "${data.franchise}"`);
      }
    }

    const updateData: Prisma.CardFranchiseFeeUpdateInput = {};
    if (data.franchise !== undefined) updateData.franchise = data.franchise;
    if (data.commission_pct !== undefined) updateData.commission_pct = data.commission_pct;
    if (data.commission_amount !== undefined) updateData.commission_amount = data.commission_amount;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    return franchiseFeeRepo.update(id, updateData);
  }

  /**
   * Eliminar franquicia — solo PAYPAC
   */
  async deleteFranchiseFee(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar comisiones por franquicia');
    }

    const franchiseFee = await franchiseFeeRepo.findById(id);
    if (!franchiseFee) {
      throw new Error('Franquicia no encontrada');
    }

    return franchiseFeeRepo.delete(id);
  }
}
