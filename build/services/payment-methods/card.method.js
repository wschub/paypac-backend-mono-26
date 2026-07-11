"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardPaymentMethod = void 0;
const axios_1 = __importDefault(require("axios"));
const payment_method_base_1 = require("./payment-method.base");
/**
 * Tarjetas de crédito/débito (CARD).
 * El front tokeniza la tarjeta con la llave pública (POST /tokens/cards)
 * y envía el token. El back crea la fuente de pago y la transacción.
 */
class CardPaymentMethod extends payment_method_base_1.WompiPaymentMethod {
    constructor() {
        super(...arguments);
        this.code = 'CARD';
        this.paymentSourceId = null;
    }
    validate(payload) {
        var _a;
        // Acepta payment_source_id (reuso de fuente existente) O token fresco
        if (payload.payment_source_id) {
            const id = Number(payload.payment_source_id);
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error('[CARD] payment_source_id debe ser un número entero positivo');
            }
        }
        else {
            this.require(payload, ['token']);
            if (!String(payload.token).startsWith('tok_')) {
                throw new Error('[CARD] El token de tarjeta no es válido (debe iniciar con tok_)');
            }
        }
        const installments = Number((_a = payload.installments) !== null && _a !== void 0 ? _a : 1);
        if (!Number.isInteger(installments) || installments < 1 || installments > 36) {
            throw new Error('[CARD] installments debe ser un entero entre 1 y 36');
        }
    }
    /** Crea la fuente de pago en Wompi (o reutiliza una existente) */
    prepare(wompi, payload, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            // Si ya se tiene el payment_source_id (tarjeta guardada usada antes),
            // omitir la llamada a /payment_sources — el token ya fue consumido.
            if (payload.payment_source_id) {
                this.paymentSourceId = Number(payload.payment_source_id);
                console.log('✅ [CARD] Reutilizando payment_source existente:', this.paymentSourceId);
                return { payment_source_id: this.paymentSourceId };
            }
            const response = yield axios_1.default.post(`${wompi.wompiUrl}/payment_sources`, Object.assign(Object.assign({ type: 'CARD', token: payload.token, acceptance_token: wompi.acceptanceToken }, (wompi.personalAuthToken
                ? { accept_personal_auth: wompi.personalAuthToken }
                : {})), { customer_email: payment.customer_email }), { headers: wompi.headers });
            this.paymentSourceId = response.data.data.id;
            console.log('✅ [CARD] Payment source creado:', this.paymentSourceId);
            return { payment_source_id: this.paymentSourceId };
        });
    }
    buildPaymentMethod(payload) {
        var _a;
        return { installments: Number((_a = payload.installments) !== null && _a !== void 0 ? _a : 1) };
    }
    extractNextAction(wompiTransaction) {
        return {
            type: 'NONE',
            data: {
                wompi_transaction_id: wompiTransaction === null || wompiTransaction === void 0 ? void 0 : wompiTransaction.id,
                payment_source_id: this.paymentSourceId,
            },
            message: 'Pago en proceso. Espera la confirmación (socket transaction:updated).',
        };
    }
}
exports.CardPaymentMethod = CardPaymentMethod;
