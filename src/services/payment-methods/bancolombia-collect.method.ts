import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Pago en efectivo en Corresponsales Bancarios Bancolombia (BANCOLOMBIA_COLLECT).
 * Wompi entrega un número de convenio + referencia de pago que el usuario
 * presenta en el corresponsal. El pago puede demorar (queda PENDING hasta
 * que el usuario consigne). Requiere polling para obtener los códigos.
 */
export class BancolombiaCollectPaymentMethod extends WompiPaymentMethod {
  readonly code = 'BANCOLOMBIA_COLLECT';
  readonly needsAsyncResource = true;

  validate(_payload: PaymentMethodPayload): void {
    // No requiere campos adicionales del front
  }

  buildPaymentMethod(_payload: PaymentMethodPayload): Record<string, any> {
    return { type: 'BANCOLOMBIA_COLLECT' };
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.payment_intention_identifier);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    const extra = wompiTransaction?.payment_method?.extra ?? {};
    return {
      type: 'CASH_REFERENCE',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        business_agreement_code: extra.business_agreement_code ?? null,
        payment_intention_identifier: extra.payment_intention_identifier ?? null,
      },
      message:
        'Muestra al usuario el número de convenio y la referencia para pagar en ' +
        'cualquier Corresponsal Bancario Bancolombia. La aprobación llega cuando consigne.',
    };
  }
}
