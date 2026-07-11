"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodFactory = void 0;
const card_method_1 = require("./card.method");
const nequi_method_1 = require("./nequi.method");
const pse_method_1 = require("./pse.method");
const bancolombia_transfer_method_1 = require("./bancolombia-transfer.method");
const bancolombia_qr_method_1 = require("./bancolombia-qr.method");
const bancolombia_collect_method_1 = require("./bancolombia-collect.method");
const daviplata_method_1 = require("./daviplata.method");
const bnpl_method_1 = require("./bnpl.method");
const pcol_method_1 = require("./pcol.method");
/**
 * Factory de métodos de pago Wompi.
 * Las reglas de cada método viven en su clase; aquí solo se resuelve el tipo.
 * El control de visibilidad/activación por canal está en la tabla PaymentMethodsUI
 * (method_code = código de este factory, method_status 1 = activo).
 */
const REGISTRY = {
    CARD: card_method_1.CardPaymentMethod,
    NEQUI: nequi_method_1.NequiPaymentMethod,
    PSE: pse_method_1.PsePaymentMethod,
    BANCOLOMBIA_TRANSFER: bancolombia_transfer_method_1.BancolombiaTransferPaymentMethod,
    BANCOLOMBIA_QR: bancolombia_qr_method_1.BancolombiaQrPaymentMethod,
    BANCOLOMBIA_COLLECT: bancolombia_collect_method_1.BancolombiaCollectPaymentMethod,
    DAVIPLATA: daviplata_method_1.DaviplataPaymentMethod,
    BANCOLOMBIA_BNPL: bnpl_method_1.BnplPaymentMethod,
    PCOL: pcol_method_1.PcolPaymentMethod,
};
class PaymentMethodFactory {
    static create(type) {
        const MethodClass = REGISTRY[String(type || '').toUpperCase()];
        if (!MethodClass) {
            throw new Error(`Método de pago no soportado: "${type}". Soportados: ${Object.keys(REGISTRY).join(', ')}`);
        }
        return new MethodClass();
    }
    static supportedCodes() {
        return Object.keys(REGISTRY);
    }
    static isSupported(type) {
        return Boolean(REGISTRY[String(type || '').toUpperCase()]);
    }
}
exports.PaymentMethodFactory = PaymentMethodFactory;
