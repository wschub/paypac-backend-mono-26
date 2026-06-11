import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * PSE. El front debe listar bancos (GET /pse/financial_institutions de Wompi,
 * expuesto por el back) y el usuario elige. Luego se redirige al banco
 * con el async_payment_url que entrega Wompi (requiere polling).
 */
export class PsePaymentMethod extends WompiPaymentMethod {
  readonly code = 'PSE';
  readonly needsAsyncResource = true;

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, [
      'user_type',
      'user_legal_id_type',
      'user_legal_id',
      'financial_institution_code',
      'payment_description',
    ]);
    if (![0, 1].includes(Number(payload.user_type))) {
      throw new Error('[PSE] user_type debe ser 0 (natural) o 1 (jurídica)');
    }
    if (String(payload.payment_description).length > 30) {
      throw new Error('[PSE] payment_description máximo 30 caracteres');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    return {
      type: 'PSE',
      user_type: Number(payload.user_type),
      user_legal_id_type: String(payload.user_legal_id_type),
      user_legal_id: String(payload.user_legal_id),
      financial_institution_code: String(payload.financial_institution_code),
      payment_description: String(payload.payment_description),
    };
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.async_payment_url);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    return {
      type: 'REDIRECT_URL',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        async_payment_url: wompiTransaction?.payment_method?.extra?.async_payment_url ?? null,
      },
      message: 'Redirige al usuario a async_payment_url para completar el pago en su banco.',
    };
  }
}
