"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NequiPaymentMethod = void 0;
const payment_method_base_1 = require("./payment-method.base");
/**
 * Nequi. El usuario recibe una notificación push en su app Nequi
 * donde aprueba o rechaza el pago. No hay redirección.
 */
class NequiPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'NEQUI';
    }
    validate(payload) {
        this.require(payload, ['phone_number']);
        if (!/^3\d{9}$/.test(String(payload.phone_number))) {
            throw new Error('[NEQUI] phone_number debe ser un celular colombiano de 10 dígitos');
        }
    }
    buildPaymentMethod(payload) {
        return {
            type: 'NEQUI',
            phone_number: String(payload.phone_number),
        };
    }
    extractNextAction(wompiTransaction) {
        return {
            type: 'NONE',
            data: { wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id },
            message: 'Revisa tu celular: Nequi te envió una notificación para aprobar el pago. ' +
                'El resultado llega por socket transaction:updated.',
        };
    }
}
exports.NequiPaymentMethod = NequiPaymentMethod;
