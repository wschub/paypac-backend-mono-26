import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Nequi. El usuario recibe una notificación push en su app Nequi
 * donde aprueba o rechaza el pago. No hay redirección.
 */
export class NequiPaymentMethod extends WompiPaymentMethod {
  readonly code = 'NEQUI';

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, ['phone_number']);
    if (!/^3\d{9}$/.test(String(payload.phone_number))) {
      throw new Error('[NEQUI] phone_number debe ser un celular colombiano de 10 dígitos');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    return {
      type: 'NEQUI',
      phone_number: String(payload.phone_number),
    };
  }

  extractNextAction(wompiTransaction: any): NextAction {
    return {
      type: 'NONE',
      data: { wompi_transaction_id: wompiTransaction?.id },
      message:
        'Revisa tu celular: Nequi te envió una notificación para aprobar el pago. ' +
        'El resultado llega por socket transaction:updated.',
    };
  }
}
