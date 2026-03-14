import { Router } from 'express';
import {
  getFinancialReport,
  getOrganizersReport,
  getEventsPortfolioReport,
  getExpansionReport,
  getRiskReport,
  getLiquidationReport,
  getSalesReport,
  getIntelligenceReport,
} from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// ── PAYPAC ────────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/paypac/financiero
 * ?range=today|month|quarter|year|custom&from=&to=
 */
router.get('/paypac/financiero',    authenticate, authorizeRoles('PAYPAC'), getFinancialReport);

/**
 * GET /api/reports/paypac/organizadores
 * ?range=...
 */
router.get('/paypac/organizadores', authenticate, authorizeRoles('PAYPAC'), getOrganizersReport);

/**
 * GET /api/reports/paypac/eventos
 * ?range=...
 */
router.get('/paypac/eventos',       authenticate, authorizeRoles('PAYPAC'), getEventsPortfolioReport);

/**
 * GET /api/reports/paypac/expansion
 */
router.get('/paypac/expansion',     authenticate, authorizeRoles('PAYPAC'), getExpansionReport);

/**
 * GET /api/reports/paypac/riesgo
 * ?range=...
 */
router.get('/paypac/riesgo',        authenticate, authorizeRoles('PAYPAC'), getRiskReport);

// ── ORGANIZER ─────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/organizer/liquidacion
 * ?event_id=&range=...
 */
router.get('/organizer/liquidacion',   authenticate, authorizeRoles('ORGANIZER', 'PAYPAC'), getLiquidationReport);

/**
 * GET /api/reports/organizer/ventas
 * ?event_id=&range=...&granularity=day|hour&date=2026-03-14
 */
router.get('/organizer/ventas',        authenticate, authorizeRoles('ORGANIZER', 'PAYPAC'), getSalesReport);

/**
 * GET /api/reports/organizer/inteligencia
 * ?event_id=
 */
router.get('/organizer/inteligencia',  authenticate, authorizeRoles('ORGANIZER', 'PAYPAC'), getIntelligenceReport);

export default router;