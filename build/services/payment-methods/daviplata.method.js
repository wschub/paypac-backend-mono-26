"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaviplataPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Daviplata. Wompi envía un OTP por SMS al celular asociado al documento.
 * El front puede usar la interfaz de Wompi (extra.url) o construir su propia
 * pantalla OTP consumiendo extra.url_services (code_otp_send / code_otp_validate).
 * Requiere polling para obtener la url / url_services.
 */
class DaviplataPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'DAVIPLATA';
        this.needsAsyncResource = true;
    }
    validate(payload) {
        this.require(payload, ['user_legal_id', 'user_legal_id_type', 'payment_description']);
        if (String(payload.payment_description).length > 30) {
            throw new Error('[DAVIPLATA] payment_description máximo 30 caracteres');
        }
    }
    buildPaymentMethod(payload) {
        return {
            type: 'DAVIPLATA',
            user_legal_id: String(payload.user_legal_id),
            user_legal_id_type: String(payload.user_legal_id_type),
            payment_description: String(payload.payment_description),
        };
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.url);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c, _d;
        const extra = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) !== null && _b !== void 0 ? _b : {};
        return {
            type: 'OTP',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                url: (_c = extra.url) !== null && _c !== void 0 ? _c : null, // interfaz OTP de Wompi (opción simple)
                url_services: (_d = extra.url_services) !== null && _d !== void 0 ? _d : null, // { token, code_otp_send, code_otp_validate } para UI propia
            },
            message: 'El usuario recibió un OTP por SMS. Usa la url de Wompi o construye tu pantalla ' +
                'OTP con url_services (enviar token como Bearer).',
        };
    }
}
exports.DaviplataPaymentMethod = DaviplataPaymentMethod;
