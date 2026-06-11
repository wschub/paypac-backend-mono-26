import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Botón de Transferencia Bancolombia. Redirección al portal Bancolombia
 * con el async_payment_url que entrega Wompi (requiere polling).
 */
export class BancolombiaTransferPaymentMethod extends WompiPaymentMethod {
  readonly code = 'BANCOLOMBIA_TRANSFER';
  readonly needsAsyncResource = true;

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, ['payment_description']);
    const desc = String(payload.payment_description);
    if (desc.length > 64) {
      throw new Error('[BANCOLOMBIA_TRANSFER] payment_description máximo 64 caracteres');
    }
    if (desc.includes("'")) {
      throw new Error('[BANCOLOMBIA_TRANSFER] payment_description no puede incluir comillas simples');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    const method: Record<string, any> = {
      type: 'BANCOLOMBIA_TRANSFER',
      user_type: payload.user_type ?? 'PERSON',
      payment_description: String(payload.payment_description),
    };
    if (payload.ecommerce_url) method.ecommerce_url = String(payload.ecommerce_url);
    return method;
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
      message: 'Redirige al usuario a async_payment_url para autenticarse en Bancolombia.',
    };
  }
}
