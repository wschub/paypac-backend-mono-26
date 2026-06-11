import {
  WompiPaymentMethod,
  PaymentMethodPayload,
  NextAction,
} from './payment-method.base';

/**
 * Bancolombia QR. Wompi genera un QR (base64) que el front debe renderizar
 * para que el usuario lo escanee con su app bancaria. Requiere polling.
 * Solo personas naturales. Pensado principalmente para el canal WEB.
 */
export class BancolombiaQrPaymentMethod extends WompiPaymentMethod {
  readonly code = 'BANCOLOMBIA_QR';
  readonly needsAsyncResource = true;

  validate(payload: PaymentMethodPayload): void {
    this.require(payload, ['payment_description']);
    if (String(payload.payment_description).length > 64) {
      throw new Error('[BANCOLOMBIA_QR] payment_description máximo 64 caracteres');
    }
  }

  buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> {
    const method: Record<string, any> = {
      type: 'BANCOLOMBIA_QR',
      payment_description: String(payload.payment_description),
    };
    // Solo aplica en Sandbox para forzar el resultado
    if (payload.sandbox_status && process.env.WOMPI_MODE === 'sandbox') {
      method.sandbox_status = String(payload.sandbox_status);
    }
    return method;
  }

  hasAsyncResource(wompiTransaction: any): boolean {
    return Boolean(wompiTransaction?.payment_method?.extra?.qr_image);
  }

  extractNextAction(wompiTransaction: any): NextAction {
    const extra = wompiTransaction?.payment_method?.extra ?? {};
    return {
      type: 'QR_CODE',
      data: {
        wompi_transaction_id: wompiTransaction?.id,
        qr_id: extra.qr_id ?? null,
        qr_image: extra.qr_image ?? null, // SVG en base64: <img src="data:image/svg+xml;base64,{qr_image}"/>
      },
      message: 'Renderiza el QR para que el usuario lo escanee con su app Bancolombia o Nequi.',
    };
  }
}
