import { PromoterCodeRepository } from '../repositories/promoter_code.repository';

const promoCodeRepo = new PromoterCodeRepository();

// Genera código único: NOMBRE + número random 4 dígitos
function generateCode(name: string): string {
  const base   = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

export class PromoterCodeService {

  async createCode(promoter_id: number, userRole: string, userId: number, customCode?: string) {
    // Solo el propio promotor o PAYPAC pueden crear el código
    if (userRole !== 'PAYPAC' && userId !== promoter_id) {
      throw new Error('No tienes permisos para crear este código');
    }

    if (userRole !== 'PROMOTER' && userRole !== 'PAYPAC') {
      throw new Error('Solo usuarios con rol PROMOTER pueden tener código de promotor');
    }

    // Un promotor solo puede tener un código activo
    const existing = await promoCodeRepo.findByPromoter(promoter_id);
    if (existing) throw new Error('Este promotor ya tiene un código asignado');

    // Generar o validar código personalizado
    let code = customCode?.toUpperCase().trim();
    if (code) {
      if (await promoCodeRepo.codeExists(code))
        throw new Error(`El código "${code}" ya está en uso`);
    } else {
      // Auto-generar único
      const user = await import('../config/db').then(m =>
        m.prisma.user.findUnique({ where: { id: promoter_id }, select: { name: true } })
      );
      do { code = generateCode(user?.name ?? 'PROMO'); }
      while (await promoCodeRepo.codeExists(code));
    }

    return promoCodeRepo.create({ promoter_id, code });
  }

  async getMyCode(promoter_id: number) {
    const code = await promoCodeRepo.findByPromoter(promoter_id);
    if (!code) throw new Error('No tienes código de promotor aún');
    return code;
  }

  async getMyStats(promoter_id: number) {
    const stats = await promoCodeRepo.getPromoterStats(promoter_id);
    if (!stats) throw new Error('No tienes código de promotor aún');
    return stats;
  }

  async validateCode(code: string) {
    const promo = await promoCodeRepo.findByCode(code.toUpperCase().trim());
    if (!promo)          throw new Error('Código de promotor no encontrado');
    if (!promo.is_active) throw new Error('Este código de promotor no está activo');
    return {
      valid:       true,
      promoter_id: promo.promoter_id,
      promoter:    promo.promoter,
      code:        promo.code,
    };
  }

  async toggleActive(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede activar/desactivar códigos');
    const code = await promoCodeRepo.findById(id);
    if (!code) throw new Error('Código no encontrado');
    return promoCodeRepo.update(id, { is_active: !code.is_active });
  }

  async getAllCodes(filters: { is_active?: boolean }, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver todos los códigos');
    return promoCodeRepo.findAll(filters);
  }

  async deleteCode(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar códigos');
    const code = await promoCodeRepo.findById(id);
    if (!code) throw new Error('Código no encontrado');
    return promoCodeRepo.delete(id);
  }

  // Llamado desde Invoice service al crear la compra
  async applyCodeToInvoice(code: string, event_id: number) {
    const promo = await promoCodeRepo.findByCode(code.toUpperCase().trim());
    if (!promo || !promo.is_active) return null;

    // Verificar que el evento permite promotores externos
    const { prisma } = await import('../config/db');
    const event = await prisma.event.findUnique({
      where: { id: event_id },
      select: { allow_external_promoters: true, commission_percentage: true },
    });
    if (!event?.allow_external_promoters) return null;

    // Buscar regla de recompensa para este evento
    const rewardRule = await prisma.eventRewardRules.findFirst({
      where: { event_id },
    });

    return {
      promoter_code_id: promo.id,
      promoter_id:      promo.promoter_id,
      reward_rule:      rewardRule,
    };
  }

  // Calcula comisión del promotor según la regla del evento
  calculatePromoterCommission(
    invoiceTotal: number,
    numTickets: number,
    rewardRule: any
  ): number {
    if (!rewardRule) return 0;

    switch (rewardRule.reward_type) {
      case 'PERCENTAGE':
        return rewardRule.reward_percentage
          ? Math.round(invoiceTotal * rewardRule.reward_percentage / 100)
          : 0;
      case 'FIXED_AMOUNT':
        // Verificar mínimos si aplican
        if (rewardRule.min_qty_tickets && numTickets < rewardRule.min_qty_tickets) return 0;
        if (rewardRule.min_amount_tickets && invoiceTotal < rewardRule.min_amount_tickets) return 0;
        return rewardRule.reward_amount ?? 0;
      default:
        return 0;
    }
  }
}