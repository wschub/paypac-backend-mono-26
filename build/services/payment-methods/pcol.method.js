"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PcolPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Puntos Colombia (PCOL). Redirección a la experiencia de redención de puntos
 * (async_payment_url, requiere polling). Si la redención es parcial
 * (remaining_amount_in_cents > 0), el front debe iniciar una segunda transacción
 * con otro método enviando parent_transaction_id.
 */
class PcolPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'PCOL';
        this.needsAsyncResource = true;
    }
    validate(_payload) {
        // No requiere campos adicionales del front
    }
    buildPaymentMethod(_payload) {
        return { type: 'PCOL' };
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.async_payment_url);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c, _d, _e, _f;
        const extra = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) !== null && _b !== void 0 ? _b : {};
        return {
            type: 'REDIRECT_URL',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                async_payment_url: (_c = extra.async_payment_url) !== null && _c !== void 0 ? _c : null,
                points_redeemed: (_d = extra.points_redeemed) !== null && _d !== void 0 ? _d : null,
                remaining_amount_in_cents: (_e = extra.remaining_amount_in_cents) !== null && _e !== void 0 ? _e : null,
                redeemed_amount_in_cents_pcol: (_f = extra.redeemed_amount_in_cents_pcol) !== null && _f !== void 0 ? _f : null,
            },
            message: 'Redirige al usuario a async_payment_url para redimir puntos. Si ' +
                'remaining_amount_in_cents > 0 al volver, inicia una segunda transacción ' +
                'con otro método enviando parent_transaction_id.',
        };
    }
}
exports.PcolPaymentMethod = PcolPaymentMethod;
