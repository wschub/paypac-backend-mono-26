import { Router } from 'express';
import { processTransaction, signature, getMyTransactions, getTransactionById } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { processTransactionSchema, signatureSchema } from '../validators/transaction.validation';

const router = Router();

/**
 * POST /api/transactions/signature
 * Generar signature para frontend
 * Acceso: Todos los usuarios autenticados
 */
router.post(
  '/signature',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(signatureSchema),
  signature
);

/**
 * POST /api/transactions/process
 * Procesar transacción completa
 * Acceso: Todos los usuarios autenticados
 */
router.post(
  '/process',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(processTransactionSchema),
  processTransaction
);

/**
 * GET /api/transactions/my-transactions
 * Obtener mis transacciones
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/my-transactions',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyTransactions
);

/**
 * GET /api/transactions/:id
 * Obtener transacción por ID
 * Acceso: Dueño o PAYPAC
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getTransactionById
);

export default router;
