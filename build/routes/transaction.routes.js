"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const transaction_validation_1 = require("../validators/transaction.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
// ⚠️ Rutas estáticas SIEMPRE antes de /:id
/**
 * POST /api/transactions/signature
 * Generar signature para el frontend
 * Acceso: todos los roles autenticados
 */
router.post('/signature', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(transaction_validation_1.signatureSchema), transaction_controller_1.signature);
/**
 * POST /api/transactions/process
 * Procesar transacción completa
 * Acceso: todos los roles autenticados
 */
router.post('/process', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(transaction_validation_1.processTransactionSchema), transaction_controller_1.processTransaction);
/**
 * GET /api/transactions/acceptance-contracts
 * Links de los contratos de aceptación Wompi (para los 2 checkboxes del front)
 * Acceso: todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get('/acceptance-contracts', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), transaction_controller_1.getAcceptanceContracts);
/**
 * GET /api/transactions/pse/financial-institutions
 * Listar bancos disponibles para PSE (proxy a Wompi)
 * Acceso: todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get('/pse/financial-institutions', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), transaction_controller_1.getPseFinancialInstitutions);
/**
 * GET /api/transactions/my-transactions
 * Obtener mis transacciones
 * Acceso: todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get('/my-transactions', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), transaction_controller_1.getMyTransactions);
/**
 * GET /api/transactions/by-reference/:reference
 * Buscar por reference (num_invoice) — uso administrativo y soporte
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get('/by-reference/:reference', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(transaction_validation_1.getTransactionByReferenceSchema), transaction_controller_1.getTransactionByReference);
/**
 * GET /api/transactions/by-invoice/:invoice_id
 * Buscar por invoice_id — reconciliación y soporte
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get('/by-invoice/:invoice_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(transaction_validation_1.getTransactionByInvoiceIdSchema), transaction_controller_1.getTransactionByInvoiceId);
/**
 * GET /api/transactions
 * Obtener todas las transacciones — vista administrativa
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), transaction_controller_1.getAllTransactions);
/**
 * GET /api/transactions/by-status/:status
 * Listar todas las transacciones por status — vista administrativa
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get('/by-status/:status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(transaction_validation_1.getTransactionsByStatusSchema), transaction_controller_1.getTransactionsByStatus);
/**
 * GET /api/transactions/:id
 * Obtener transacción por ID — dueño o PAYPAC
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(transaction_validation_1.getTransactionByIdSchema), transaction_controller_1.getTransactionById);
exports.default = router;
