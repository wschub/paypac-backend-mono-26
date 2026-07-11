"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByStatus = exports.getAllTransactions = exports.getTransactionByInvoiceId = exports.getTransactionByReference = exports.getTransactionById = exports.getMyTransactions = exports.getPseFinancialInstitutions = exports.getAcceptanceContracts = exports.processTransaction = exports.signature = void 0;
const transaction_service_1 = require("../services/transaction.service");
const ConfigManager_1 = require("../utils/ConfigManager");
const utils_1 = require("../utils/utils");
const transactionService = new transaction_service_1.TransactionService();
/**
 * POST /api/transactions/signature
 * Generar signature para el frontend
 */
const signature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency, expiration_date } = req.body;
        const reference = yield (0, utils_1.createNumInvoice)();
        const getSignature = yield ConfigManager_1.configManager.getSignature(reference, amount, currency, expiration_date);
        console.log('✅ Signature generada:', { reference, signature: getSignature });
        res.status(200).json({
            success: true,
            reference,
            signature: getSignature,
        });
    }
    catch (err) {
        console.error('❌ Error generando signature:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.signature = signature;
/**
 * POST /api/transactions/process
 * Procesar transacción completa
 */
const processTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, user_uid, user_num_doc, user_type_doc, event_id, qty_items, apply_discount, amount_in_cents, status, customer_ID_phone, codeDCTO, paymentMethodType, token_card_user, installments_user, shoppingCart, invoice_id, sale_channel, payment_method, redirect_url, } = req.body;
        console.log('📨 Procesando transacción:', {
            user_id, event_id, amount_in_cents, invoice_id, sale_channel,
            payment_method_type: (payment_method === null || payment_method === void 0 ? void 0 : payment_method.type) || paymentMethodType,
        });
        const result = yield transactionService.processTransaction({
            user_id, user_uid, user_num_doc, user_type_doc,
            event_id, qty_items, apply_discount, amount_in_cents,
            status, customer_ID_phone, codeDCTO, paymentMethodType,
            token_card_user, installments_user, shoppingCart,
            invoice_id, sale_channel, payment_method, redirect_url,
        });
        res.status(200).json({
            success: true,
            message: result.message,
            invoice: result.invoice,
            transaction: result.transaction,
            payment_result: result.paymentResult,
            next_action: result.next_action,
        });
    }
    catch (err) {
        console.error('❌ Error procesando transacción:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.processTransaction = processTransaction;
/**
 * GET /api/transactions/acceptance-contracts
 * Contratos de aceptación Wompi (Habeas Data) — proxy a GET /merchants/:pub_key
 *
 * El front debe mostrar DOS checkboxes antes de iniciar el pago o guardar una
 * tarjeta, cada uno con el link (permalink) de su contrato PDF:
 *  1. privacy_policy        → Términos y condiciones / política de privacidad
 *  2. personal_data_auth    → Autorización de tratamiento de datos personales
 */
const getAcceptanceContracts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const axios = (yield Promise.resolve().then(() => __importStar(require('axios')))).default;
        const { getWompiBaseUrl, getWompiPublicKey } = yield Promise.resolve().then(() => __importStar(require('../utils/wompi.utils')));
        const response = yield axios.get(`${getWompiBaseUrl()}/merchants/${getWompiPublicKey()}`);
        const data = response.data.data;
        res.status(200).json({
            success: true,
            privacy_policy: {
                permalink: (_b = (_a = data.presigned_acceptance) === null || _a === void 0 ? void 0 : _a.permalink) !== null && _b !== void 0 ? _b : null,
                type: (_d = (_c = data.presigned_acceptance) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : 'END_USER_POLICY',
            },
            personal_data_auth: {
                permalink: (_f = (_e = data.presigned_personal_data_auth) === null || _e === void 0 ? void 0 : _e.permalink) !== null && _f !== void 0 ? _f : null,
                type: (_h = (_g = data.presigned_personal_data_auth) === null || _g === void 0 ? void 0 : _g.type) !== null && _h !== void 0 ? _h : 'PERSONAL_DATA_AUTH',
            },
        });
    }
    catch (err) {
        console.error('❌ Error obteniendo contratos de aceptación:', err.message);
        res.status(400).json({ success: false, message: 'No fue posible obtener los contratos de aceptación' });
    }
});
exports.getAcceptanceContracts = getAcceptanceContracts;
/**
 * GET /api/transactions/pse/financial-institutions
 * Listar bancos disponibles para PSE (proxy a Wompi)
 * El front la necesita para que el usuario elija su banco antes de pagar con PSE
 */
const getPseFinancialInstitutions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const axios = (yield Promise.resolve().then(() => __importStar(require('axios')))).default;
        const { getWompiBaseUrl, getWompiPublicKey } = yield Promise.resolve().then(() => __importStar(require('../utils/wompi.utils')));
        const response = yield axios.get(`${getWompiBaseUrl()}/pse/financial_institutions`, {
            headers: { Authorization: `Bearer ${getWompiPublicKey()}` },
        });
        res.status(200).json({
            success: true,
            financial_institutions: response.data.data,
        });
    }
    catch (err) {
        console.error('❌ Error listando bancos PSE:', err.message);
        res.status(400).json({ success: false, message: 'No fue posible obtener la lista de bancos' });
    }
});
exports.getPseFinancialInstitutions = getPseFinancialInstitutions;
/**
 * GET /api/transactions/my-transactions
 * Obtener mis transacciones
 */
const getMyTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield transactionService.getUserTransactions(userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getMyTransactions = getMyTransactions;
/**
 * GET /api/transactions/:id
 * Obtener transacción por ID — dueño o PAYPAC
 */
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;
        const transaction = yield transactionService.getTransactionById(transactionId, userId, userRole);
        res.status(200).json({ success: true, transaction });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getTransactionById = getTransactionById;
/**
 * GET /api/transactions/by-reference/:reference
 * Buscar transacción por reference (num_invoice) — solo PAYPAC
 */
const getTransactionByReference = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.user.role;
        //const { reference } = req.params;
        const reference = (0, utils_1.paramToString)(req.params.reference);
        const transaction = yield transactionService.getTransactionByReference(reference, userRole);
        res.status(200).json({ success: true, transaction });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getTransactionByReference = getTransactionByReference;
/**
 * GET /api/transactions/by-invoice/:invoice_id
 * Buscar transacción por invoice_id — solo PAYPAC
 */
const getTransactionByInvoiceId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.user.role;
        //const { invoice_id } = req.params;
        const invoiceId = (0, utils_1.paramToString)(req.params.invoice_id);
        const transaction = yield transactionService.getTransactionByInvoiceId(invoiceId, userRole);
        res.status(200).json({ success: true, transaction });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getTransactionByInvoiceId = getTransactionByInvoiceId;
/**
 * GET / solo PAYPAC (vista administrativa)
 * TODAS LAS TRANSACCIONES
 */
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.user.role;
        const transactions = yield transactionService.getAllTransactions(userRole);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getAllTransactions = getAllTransactions;
/**
 * GET /api/transactions/by-status/:status
 * Listar transacciones por status — solo PAYPAC (vista administrativa)
 */
const getTransactionsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.user.role;
        //const { status } = req.params;
        const status = (0, utils_1.paramToString)(req.params.status);
        const transactions = yield transactionService.getTransactionsByStatus(status, userRole);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getTransactionsByStatus = getTransactionsByStatus;
