"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BnplPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/** Monto mínimo BNPL: $100.000 COP en centavos */
const BNPL_MIN_AMOUNT_IN_CENTS = 10000000;
/**
 * BNPL Bancolombia (BANCOLOMBIA_BNPL). Crédito sin intereses en 4 cuotas,
 * solo para montos >= $100.000 COP. Redirección a la experiencia BNPL
 * con extra.url (requiere polling).
 */
class BnplPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'BANCOLOMBIA_BNPL';
        this.needsAsyncResource = true;
    }
    validate(payload, payment) {
        this.require(payload, [
            'name',
            'last_name',
            'user_legal_id_type',
            'user_legal_id',
            'phone_number',
            'phone_code',
            'payment_description',
        ]);
        if (payment.amount_in_cents < BNPL_MIN_AMOUNT_IN_CENTS) {
            throw new Error('[BANCOLOMBIA_BNPL] El monto mínimo para BNPL es $100.000 COP');
        }
        if (String(payload.payment_description).length > 30) {
            throw new Error('[BANCOLOMBIA_BNPL] payment_description máximo 30 caracteres');
        }
    }
    buildPaymentMethod(payload) {
        return {
            type: 'BANCOLOMBIA_BNPL',
            name: String(payload.name),
            last_name: String(payload.last_name),
            user_legal_id_type: String(payload.user_legal_id_type),
            user_legal_id: String(payload.user_legal_id),
            phone_number: String(payload.phone_number),
            phone_code: String(payload.phone_code),
            redirect_url: payload.redirect_url ? String(payload.redirect_url) : undefined,
            payment_description: String(payload.payment_description),
        };
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.url);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c;
        return {
            type: 'REDIRECT_URL',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                async_payment_url: (_c = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.url) !== null && _c !== void 0 ? _c : null,
            },
            message: 'Redirige al usuario a la experiencia BNPL Bancolombia para solicitar el crédito.',
        };
    }
}
exports.BnplPaymentMethod = BnplPaymentMethod;
