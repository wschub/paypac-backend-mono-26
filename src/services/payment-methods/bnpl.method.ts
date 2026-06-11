import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  PaymentContext,
  NextAction,
} from './payment-method.base';

/** Monto mínimo BNPL: $100.000 COP en centavos */
const BNPL_MIN_AMOUNT_IN_CENTS = 10000000;

/**
 * BNPL Bancolombia (BANCOLOMBIA_BNPL). Crédito sin intereses en 4 cuotas,
 * solo para montos >= $100.000 COP. Redirección a la experiencia BNPL
 * con extra.url (requiere polling).
 */
export class BnplPaymentMethod extends WompiPaymentMethod {
  readonly code = 'BANCOLOMBIA_BNPL';
  readonly needsAsyncResource = true;

  validate(payload: PaymentMethodPayload, payment: PaymentContext): void {
    this.require(payload, [
      'name',
      'last_name',
      'user_legal_id_type',
      'user_legal_id',
      'phone_number',
      'phone_code',
      'payment_description',
    ]);
    if (payment.amount_in_cents < BNPL_MIN_AMOUNT_IN_CENTS) {
      throw new Error(
        '[BANCOLOMBIA_BNPL] El monto mínimo para BNPL es $100.000 COP'
      );
    }
    if (String(payload.payment_description).length > 30) {
      throw new Error('[BANCOLOMBIA_BNPL] payment_description máximo 30 caracteres');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    return {
      type: 'BANCOLOMBIA_BNPL',
      name: String(payload.name),
      last_name: String(payload.last_name),
      user_legal_id_type: String(payload.user_legal_id_type),
      user_legal_id: String(payload.user_legal_id),
      phone_number: String(payload.phone_number),
      phone_code: String(payload.phone_code),
      redirect_url: payload.redirect_url ? String(payload.redirect_url) : undefined,
      payment_description: String(payload.payment_description),
    };
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.url);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    return {
      type: 'REDIRECT_URL',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        async_payment_url: wompiTransaction?.payment_method?.extra?.url ?? null,
      },
      message: 'Redirige al usuario a la experiencia BNPL Bancolombia para solicitar el crédito.',
    };
  }
}
