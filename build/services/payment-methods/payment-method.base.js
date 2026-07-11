"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WompiPaymentMethod = void 0;
class WompiPaymentMethod {
    constructor() {
        /**
         * Si true, la respuesta inmediata de POST /transactions no trae la info que el
         * front necesita (async_payment_url, QR, OTP) y hay que hacer polling al
         * GET /transactions/:id hasta que aparezca.
         */
        this.needsAsyncResource = false;
    }
    /**
     * Pasos previos a crear la transacción (ej: CARD crea el payment_source).
     * Retorna campos adicionales que se mezclan en el body de POST /transactions.
     */
    prepare(_wompi, _payload, _payment) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    /** ¿La transacción ya trae el recurso async que el front necesita? (para cortar el polling) */
    hasAsyncResource(_wompiTransaction) {
        return true;
    }
    /** Helper: exige campos obligatorios en el payload */
    require(payload, fields) {
        const missing = fields.filter((f) => payload[f] === undefined || payload[f] === null || payload[f] === '');
        if (missing.length > 0) {
            throw new Error(`[${this.code}] Faltan campos obligatorios en payment_method: ${missing.join(', ')}`);
        }
    }
}
exports.WompiPaymentMethod = WompiPaymentMethod;
