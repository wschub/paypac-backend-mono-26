import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Puntos Colombia (PCOL). Redirección a la experiencia de redención de puntos
 * (async_payment_url, requiere polling). Si la redención es parcial
 * (remaining_amount_in_cents > 0), el front debe iniciar una segunda transacción
 * con otro método enviando parent_transaction_id.
 */
export class PcolPaymentMethod extends WompiPaymentMethod {
  readonly code = 'PCOL';
  readonly needsAsyncResource = true;

  validate(_payload: PaymentMethodPayload): void {
    // No requiere campos adicionales del front
  }

  buildPaymentMethod(_payload: PaymentMethodPayload): Record<string, any> {
    return { type: 'PCOL' };
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.async_payment_url);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    const extra = wompiTransaction?.payment_method?.extra ?? {};
    return {
      type: 'REDIRECT_URL',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        async_payment_url: extra.async_payment_url ?? null,
        points_redeemed: extra.points_redeemed ?? null,
        remaining_amount_in_cents: extra.remaining_amount_in_cents ?? null,
        redeemed_amount_in_cents_pcol: extra.redeemed_amount_in_cents_pcol ?? null,
      },
      message:
        'Redirige al usuario a async_payment_url para redimir puntos. Si ' +
        'remaining_amount_in_cents > 0 al volver, inicia una segunda transacción ' +
        'con otro método enviando parent_transaction_id.',
    };
  }
}
