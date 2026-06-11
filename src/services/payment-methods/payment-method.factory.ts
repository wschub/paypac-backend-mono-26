import { WompiPaymentMethod } from './payment-method.base';
import { CardPaymentMethod } from './card.method';
import { NequiPaymentMethod } from './nequi.method';
import { PsePaymentMethod } from './pse.method';
import { BancolombiaTransferPaymentMethod } from './bancolombia-transfer.method';
import { BancolombiaQrPaymentMethod } from './bancolombia-qr.method';
import { BancolombiaCollectPaymentMethod } from './bancolombia-collect.method';
import { DaviplataPaymentMethod } from './daviplata.method';
import { BnplPaymentMethod } from './bnpl.method';
import { PcolPaymentMethod } from './pcol.method';

/**
 * Factory de métodos de pago Wompi.
 * Las reglas de cada método viven en su clase; aquí solo se resuelve el tipo.
 * El control de visibilidad/activación por canal está en la tabla PaymentMethodsUI
 * (method_code = código de este factory, method_status 1 = activo).
 */
const REGISTRY: Record<string, new () => WompiPaymentMethod> = {
  CARD: CardPaymentMethod,
  NEQUI: NequiPaymentMethod,
  PSE: PsePaymentMethod,
  BANCOLOMBIA_TRANSFER: BancolombiaTransferPaymentMethod,
  BANCOLOMBIA_QR: BancolombiaQrPaymentMethod,
  BANCOLOMBIA_COLLECT: BancolombiaCollectPaymentMethod,
  DAVIPLATA: DaviplataPaymentMethod,
  BANCOLOMBIA_BNPL: BnplPaymentMethod,
  PCOL: PcolPaymentMethod,
};

export class PaymentMethodFactory {
  static create(type: string): WompiPaymentMethod {
    const MethodClass = REGISTRY[String(type || '').toUpperCase()];
    if (!MethodClass) {
      throw new Error(
        `Método de pago no soportado: "${type}". Soportados: ${Object.keys(REGISTRY).join(', ')}`
      );
    }
    return new MethodClass();
  }

  static supportedCodes(): string[] {
    return Object.keys(REGISTRY);
  }

  static isSupported(type: string): boolean {
    return Boolean(REGISTRY[String(type || '').toUpperCase()]);
  }
}
