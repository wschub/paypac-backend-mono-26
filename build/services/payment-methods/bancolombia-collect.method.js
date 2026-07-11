"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BancolombiaCollectPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Pago en efectivo en Corresponsales Bancarios Bancolombia (BANCOLOMBIA_COLLECT).
 * Wompi entrega un número de convenio + referencia de pago que el usuario
 * presenta en el corresponsal. El pago puede demorar (queda PENDING hasta
 * que el usuario consigne). Requiere polling para obtener los códigos.
 */
class BancolombiaCollectPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'BANCOLOMBIA_COLLECT';
        this.needsAsyncResource = true;
    }
    validate(_payload) {
        // No requiere campos adicionales del front
    }
    buildPaymentMethod(_payload) {
        return { type: 'BANCOLOMBIA_COLLECT' };
    }
    hasAsyncResource(wompiTransaction) {
        var _a, _b;
        return Boolean((_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b.payment_intention_identifier);
    }
    extractNextAction(wompiTransaction) {
        var _a, _b, _c, _d;
        const extra = (_b = (_a = wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.payment_method) === null || _a === void 0 ? void 0 : _a.extra) !== null && _b !== void 0 ? _b : {};
        return {
            type: 'CASH_REFERENCE',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                business_agreement_code: (_c = extra.business_agreement_code) !== null && _c !== void 0 ? _c : null,
                payment_intention_identifier: (_d = extra.payment_intention_identifier) !== null && _d !== void 0 ? _d : null,
            },
            message: 'Muestra al usuario el número de convenio y la referencia para pagar en ' +
                'cualquier Corresponsal Bancario Bancolombia. La aprobación llega cuando consigne.',
        };
    }
}
exports.BancolombiaCollectPaymentMethod = BancolombiaCollectPaymentMethod;
