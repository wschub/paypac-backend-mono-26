"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BancolombiaTransferPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Botón de Transferencia Bancolombia. Redirección al portal Bancolombia
 * con el async_payment_url que entrega Wompi (requiere polling).
 */
class BancolombiaTransferPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'BANCOLOMBIA_TRANSFER';
        this.needsAsyncResource = true;
    }
    validate(payload) {
        this.require(payload, ['payment_description']);
        const desc = String(payload.payment_description);
        if (desc.length > 64) {
            throw new Error('[BANCOLOMBIA_TRANSFER] payment_description máximo 64 caracteres');
        }
        if (desc.includes("'")) {
            throw new Error('[BANCOLOMBIA_TRANSFER] payment_description no puede incluir comillas simples');
        }
    }
    buildPaymentMethod(payload) {
        var _a;
        const method = {
            type: 'BANCOLOMBIA_TRANSFER',
            user_type: (_a = payload.user_type) !== null && _a !== void 0 ? _a : 'PERSON',
            payment_description: String(payload.payment_description),
        };
        if (payload.ecommerce_url)
            method.ecommerce_url = String(payload.ecommerce_url);
        return method;
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.async_payment_url);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c;
        return {
            type: 'REDIRECT_URL',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                async_payment_url: (_c = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.async_payment_url) !== null && _c !== void 0 ? _c : null,
            },
            message: 'Redirige al usuario a async_payment_url para autenticarse en Bancolombia.',
        };
    }
}
exports.BancolombiaTransferPaymentMethod = BancolombiaTransferPaymentMethod;
