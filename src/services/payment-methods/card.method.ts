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
    // Acepta payment_source_id (reuso de fuente existente) O token fresco
    if (payload.payment_source_id) {
      const id = Number(payload.payment_source_id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('[CARD] payment_source_id debe ser un número entero positivo');
      }
    } else {
      this.require(payload, ['token']);
      if (!String(payload.token).startsWith('tok_')) {
        throw new Error('[CARD] El token de tarjeta no es válido (debe iniciar con tok_)');
      }
    }
    const installments = Number(payload.installments ?? 1);
    if (!Number.isInteger(installments) || installments < 1 || installments > 36) {
      throw new Error('[CARD] installments debe ser un entero entre 1 y 36');
    }
  }

  /** Crea la fuente de pago en Wompi (o reutiliza una existente) */
  async prepare(
    wompi: WompiContext,
    payload: PaymentMethodPayload,
    payment: PaymentContext
  ): Promise<Record<string, any>> {
    // Si ya se tiene el payment_source_id (tarjeta guardada usada antes),
    // omitir la llamada a /payment_sources — el token ya fue consumido.
    if (payload.payment_source_id) {
      this.paymentSourceId = Number(payload.payment_source_id);
      console.log('✅ [CARD] Reutilizando payment_source existente:', this.paymentSourceId);
      return { payment_source_id: this.paymentSourceId };
    }

    const response = await axios.post(
      `${wompi.wompiUrl}/payment_sources`,
      {
        type: 'CARD',
        token: payload.token,
        acceptance_token: wompi.acceptanceToken,
        ...(wompi.personalAuthToken
          ? { accept_personal_auth: wompi.personalAuthToken }
          : {}),
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
