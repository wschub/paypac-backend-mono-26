import axios from 'axios';
import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  PaymentContext,
  WompiContext,
  NextAction,
} from './payment-method.base';

/**
 * Tarjetas de crédito/débito (CARD).
 * El front tokeniza la tarjeta con la llave pública (POST /tokens/cards)
 * y envía el token. El back crea la fuente de pago y la transacción.
 */
export class CardPaymentMethod extends WompiPaymentMethod {
  readonly code = 'CARD';

  private paymentSourceId: number | null = null;

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, ['token']);
    if (!String(payload.token).startsWith('tok_')) {
      throw new Error('[CARD] El token de tarjeta no es válido (debe iniciar con tok_)');
    }
    const installments = Number(payload.installments ?? 1);
    if (!Number.isInteger(installments) || installments < 1 || installments > 36) {
      throw new Error('[CARD] installments debe ser un entero entre 1 y 36');
    }
  }

  /** Crea la fuente de pago en Wompi y retorna payment_source_id para el body */
  async prepare(
    wompi: WompiContext,
    payload: PaymentMethodPayload,
    payment: PaymentContext
  ): Promise<Record<string, any>> {
    const response = await axios.post(
      `${wompi.wompiUrl}/payment_sources`,
      {
        type: 'CARD',
        token: payload.token,
        acceptance_token: wompi.acceptanceToken,
        customer_email: payment.customer_email,
      },
      { headers: wompi.headers }
    );

    this.paymentSourceId = response.data.data.id;
    console.log('✅ [CARD] Payment source creado:', this.paymentSourceId);

    return { payment_source_id: this.paymentSourceId };
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    return { installments: Number(payload.installments ?? 1) };
  }

  extractNextAction(wompiTransaction: any): NextAction {
    return {
      type: 'NONE',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        payment_source_id: this.paymentSourceId,
      },
      message: 'Pago en proceso. Espera la confirmación (socket transaction:updated).',
    };
  }
}
