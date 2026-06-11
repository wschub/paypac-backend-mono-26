import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Daviplata. Wompi envía un OTP por SMS al celular asociado al documento.
 * El front puede usar la interfaz de Wompi (extra.url) o construir su propia
 * pantalla OTP consumiendo extra.url_services (code_otp_send / code_otp_validate).
 * Requiere polling para obtener la url / url_services.
 */
export class DaviplataPaymentMethod extends WompiPaymentMethod {
  readonly code = 'DAVIPLATA';
  readonly needsAsyncResource = true;

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, ['user_legal_id', 'user_legal_id_type', 'payment_description']);
    if (String(payload.payment_description).length > 30) {
      throw new Error('[DAVIPLATA] payment_description máximo 30 caracteres');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    return {
      type: 'DAVIPLATA',
      user_legal_id: String(payload.user_legal_id),
      user_legal_id_type: String(payload.user_legal_id_type),
      payment_description: String(payload.payment_description),
    };
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.url);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    const extra = wompiTransaction?.payment_method?.extra ?? {};
    return {
      type: 'OTP',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        url: extra.url ?? null,                   // interfaz OTP de Wompi (opción simple)
        url_services: extra.url_services ?? null, // { token, code_otp_send, code_otp_validate } para UI propia
      },
      message:
        'El usuario recibió un OTP por SMS. Usa la url de Wompi o construye tu pantalla ' +
        'OTP con url_services (enviar token como Bearer).',
    };
  }
}
