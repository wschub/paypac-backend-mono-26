import { prisma } from '../config/db';

/**
 * Calcula y guarda en el Invoice la comisión real que Wompi cobró en la
 * transacción — solo se puede saber con certeza al confirmarse APPROVED,
 * porque solo ahí Wompi informa la franquicia real de la tarjeta (si aplica).
 * Idempotente: si el invoice ya tiene la comisión calculada, no la repite
 * (protege contra reintentos/duplicados del webhook).
 */
export class WompiFeeService {
  async calculateAndStore(
    invoiceId: number,
    paymentMethodType: string,
    paymentMethodExtra: any
  ): Promise<void> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return;
    if (invoice.wompi_fee_amount && invoice.wompi_fee_amount > 0) return;

    const franchise: string | null =
      paymentMethodType === 'CARD' ? (paymentMethodExtra?.brand ?? null) : null;

    let commission_pct = 0;
    let commission_amount = 0;
    let matched = false;

    if (franchise) {
      const franchiseFee = await prisma.cardFranchiseFee.findUnique({ where: { franchise } });
      if (franchiseFee?.is_active) {
        commission_pct = franchiseFee.commission_pct;
        commission_amount = franchiseFee.commission_amount;
        matched = true;
      }
    }

    if (!matched) {
      const methodFee = await prisma.paymentMethodsUI.findFirst({
        where: { method_code: paymentMethodType },
      });
      if (methodFee) {
        commission_pct = methodFee.commission_pct;
        commission_amount = methodFee.commission_amount;
      }
    }

    const wompi_fee_amount = Math.round((invoice.total * commission_pct) / 100) + commission_amount;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        wompi_fee_pct: commission_pct,
        wompi_fee_amount,
        card_franchise: franchise,
      },
    });
  }
}
