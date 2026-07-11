"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsePaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * PSE. El front debe listar bancos (GET /pse/financial_institutions de Wompi,
 * expuesto por el back) y el usuario elige. Luego se redirige al banco
 * con el async_payment_url que entrega Wompi (requiere polling).
 */
class PsePaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'PSE';
        this.needsAsyncResource = true;
    }
    validate(payload) {
        this.require(payload, [
            'user_type',
            'user_legal_id_type',
            'user_legal_id',
            'financial_institution_code',
            'payment_description',
        ]);
        if (![0, 1].includes(Number(payload.user_type))) {
            throw new Error('[PSE] user_type debe ser 0 (natural) o 1 (jurídica)');
        }
        if (String(payload.payment_description).length > 30) {
            throw new Error('[PSE] payment_description máximo 30 caracteres');
        }
    }
    buildPaymentMethod(payload) {
        return {
            type: 'PSE',
            user_type: Number(payload.user_type),
            user_legal_id_type: String(payload.user_legal_id_type),
            user_legal_id: String(payload.user_legal_id),
            financial_institution_code: String(payload.financial_institution_code),
            payment_description: String(payload.payment_description),
        };
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
            message: 'Redirige al usuario a async_payment_url para completar el pago en su banco.',
        };
    }
}
exports.PsePaymentMethod = PsePaymentMethod;
