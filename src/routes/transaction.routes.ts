import { Router } from 'express';
import {
  signature,
  processTransaction,
  getMyTransactions,
  getTransactionById,
  getTransactionByReference,
  getTransactionByInvoiceId,
  getTransactionsByStatus,
  getAllTransactions,
  getPseFinancialInstitutions
} from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  signatureSchema,
  processTransactionSchema,
  getTransactionByIdSchema,
  getTransactionByReferenceSchema,
  getTransactionByInvoiceIdSchema,
  getTransactionsByStatusSchema,
} from '../validators/transaction.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

// ⚠️ Rutas estáticas SIEMPRE antes de /:id

/**
 * POST /api/transactions/signature
 * Generar signature para el frontend
 * Acceso: todos los roles autenticados
 */
router.post(
  '/signature',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(signatureSchema),
  signature
);

/**
 * POST /api/transactions/process
 * Procesar transacción completa
 * Acceso: todos los roles autenticados
 */
router.post(
  '/process',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(processTransactionSchema),
  processTransaction
);

/**
 * GET /api/transactions/pse/financial-institutions
 * Listar bancos disponibles para PSE (proxy a Wompi)
 * Acceso: todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get(
  '/pse/financial-institutions',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getPseFinancialInstitutions
);

/**
 * GET /api/transactions/my-transactions
 * Obtener mis transacciones
 * Acceso: todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get(
  '/my-transactions',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getMyTransactions
);

/**
 * GET /api/transactions/by-reference/:reference
 * Buscar por reference (num_invoice) — uso administrativo y soporte
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get(
  '/by-reference/:reference',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getTransactionByReferenceSchema),
  getTransactionByReference
);

/**
 * GET /api/transactions/by-invoice/:invoice_id
 * Buscar por invoice_id — reconciliación y soporte
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get(
  '/by-invoice/:invoice_id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getTransactionByInvoiceIdSchema),
  getTransactionByInvoiceId
);

/**
 * GET /api/transactions
 * Obtener todas las transacciones — vista administrativa
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  getAllTransactions
);


/**
 * GET /api/transactions/by-status/:status
 * Listar todas las transacciones por status — vista administrativa
 * Acceso: solo PAYPAC
 * ⚠️ Antes de /:id
 */
router.get(
  '/by-status/:status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getTransactionsByStatusSchema),
  getTransactionsByStatus
);

/**
 * GET /api/transactions/:id
 * Obtener transacción por ID — dueño o PAYPAC
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getTransactionByIdSchema),
  getTransactionById
);

export default router;