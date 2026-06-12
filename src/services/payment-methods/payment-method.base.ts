/**
 * Capa polimórfica de métodos de pago Wompi.
 *
 * Cada método de pago (CARD, NEQUI, PSE, etc.) implementa esta clase base.
 * La instanciación se hace con PaymentMethodFactory desde la lógica/controlador.
 *
 * Responsabilidades de cada clase concreta:
 *  1. validate()            → valida el payload que envía el front según las reglas del método
 *  2. prepare()             → pasos previos a POST /transactions (ej: CARD crea payment_source)
 *  3. buildPaymentMethod()  → construye el objeto `payment_method` que espera Wompi
 *  4. extractNextAction()   → traduce la respuesta de Wompi a la acción que debe ejecutar el front
 */

/** Payload genérico que envía el front en el campo payment_method */
export interface PaymentMethodPayload {
  type: string;
  [key: string]: any;
}

/** Contexto de conexión a Wompi (lo arma TransactionService) */
export interface WompiContext {
  wompiUrl: string;          // URL base del API (sandbox o producción)
  acceptanceToken: string;   // acceptance_token vigente (política de privacidad)
  personalAuthToken?: string; // accept_personal_auth vigente (tratamiento de datos personales)
  headers: Record<string, string>; // Authorization Bearer llave privada
}

/** Datos de la transacción en curso */
export interface PaymentContext {
  reference: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  customer_data: any;
  redirect_url: string;
  expiration_time?: string;
}

/** Acción que el front debe ejecutar después de crear la transacción */
export type NextActionType =
  | 'NONE'            // solo esperar resultado (webhook/socket): CARD, NEQUI
  | 'REDIRECT_URL'    // redirigir al usuario a una URL: PSE, BANCOLOMBIA_TRANSFER, PCOL, BNPL
  | 'QR_CODE'         // renderizar QR: BANCOLOMBIA_QR
  | 'OTP'             // capturar código OTP: DAVIPLATA
  | 'CASH_REFERENCE'; // mostrar convenio + referencia de pago en efectivo: BANCOLOMBIA_COLLECT

export interface NextAction {
  type: NextActionType;
  /** Datos específicos según el tipo (url, qr_image, url_services, códigos, etc.) */
  data: Record<string, any>;
  /** Mensaje guía para mostrar al usuario */
  message: string;
}

export abstract class WompiPaymentMethod {
  /** Código del método — coincide con method_code en PaymentMethodsUI y type de Wompi */
  abstract readonly code: string;

  /**
   * Si true, la respuesta inmediata de POST /transactions no trae la info que el
   * front necesita (async_payment_url, QR, OTP) y hay que hacer polling al
   * GET /transactions/:id hasta que aparezca.
   */
  readonly needsAsyncResource: boolean = false;

  /** Validar el payload que llega del front. Lanza Error con mensaje claro si algo falta. */
  abstract validate(payload: PaymentMethodPayload, payment: PaymentContext): void;

  /**
   * Pasos previos a crear la transacción (ej: CARD crea el payment_source).
   * Retorna campos adicionales que se mezclan en el body de POST /transactions.
   */
  async prepare(
    _wompi: WompiContext,
    _payload: PaymentMethodPayload,
    _payment: PaymentContext
  ): Promise<Record<string, any>> {
    return {};
  }

  /**
   * Construye el objeto payment_method del body de POST /transactions.
   * Retorna undefined cuando el método no requiere objeto (ej: CARD con payment_source sin cuotas).
   */
  abstract buildPaymentMethod(payload: PaymentMethodPayload): Record<string, any> | undefined;

  /** ¿La transacción ya trae el recurso async que el front necesita? (para cortar el polling) */
  hasAsyncResource(_wompiTransaction: any): boolean {
    return true;
  }

  /** Traduce la respuesta de Wompi a la acción que debe ejecutar el front */
  abstract extractNextAction(wompiTransaction: any): NextAction;

  /** Helper: exige campos obligatorios en el payload */
  protected require(payload: PaymentMethodPayload, fields: string[]): void {
    const missing = fields.filter(
      (f) => payload[f] === undefined || payload[f] === null || payload[f] === ''
    );
    if (missing.length > 0) {
      throw new Error(
        `[${this.code}] Faltan campos obligatorios en payment_method: ${missing.join(', ')}`
      );
    }
  }
}
