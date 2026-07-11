"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BancolombiaQrPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Bancolombia QR. Wompi genera un QR (base64) que el front debe renderizar
 * para que el usuario lo escanee con su app bancaria. Requiere polling.
 * Solo personas naturales. Pensado principalmente para el canal WEB.
 */
class BancolombiaQrPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'BANCOLOMBIA_QR';
        this.needsAsyncResource = true;
    }
    validate(payload) {
        this.require(payload, ['payment_description']);
        if (String(payload.payment_description).length > 64) {
            throw new Error('[BANCOLOMBIA_QR] payment_description máximo 64 caracteres');
        }
    }
    buildPaymentMethod(payload) {
        const method = {
            type: 'BANCOLOMBIA_QR',
            payment_description: String(payload.payment_description),
        };
        // Solo aplica en Sandbox para forzar el resultado
        if (payload.sandbox_status && process.env.WOMPI_MODE === 'sandbox') {
            method.sandbox_status = String(payload.sandbox_status);
        }
        return method;
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.qr_image);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c, _d;
        const extra = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) !== null && _b !== void 0 ? _b : {};
        return {
            type: 'QR_CODE',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                qr_id: (_c = extra.qr_id) !== null && _c !== void 0 ? _c : null,
                qr_image: (_d = extra.qr_image) !== null && _d !== void 0 ? _d : null, // SVG en base64: <img src="data:image/svg+xml;base64,{qr_image}"/>
            },
            message: 'Renderiza el QR para que el usuario lo escanee con su app Bancolombia o Nequi.',
        };
    }
}
exports.BancolombiaQrPaymentMethod = BancolombiaQrPaymentMethod;
