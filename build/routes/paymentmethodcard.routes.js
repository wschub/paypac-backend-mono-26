"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentmethodcard_controller_1 = require("../controllers/paymentmethodcard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const paymentmethodcard_validation_1 = require("../validators/paymentmethodcard.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/payment-cards
 * Guardar una nueva tarjeta tokenizada
 * Acceso: Todos los roles autenticados
 *
 * FLUJO:
 * 1. Frontend tokeniza tarjeta en Wompi
 * 2. Frontend envía token a este endpoint
 * 3. Backend guarda tarjeta en BD
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodcard_validation_1.createPaymentMethodCardSchema), paymentmethodcard_controller_1.createCard);
/**
 * GET /api/payment-cards
 * Listar todas las tarjetas del usuario autenticado
 * Acceso: Todos los roles autenticados
 *
 * Query params opcionales:
 * - active_only: true | false (filtrar solo tarjetas no expiradas)
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodcard_validation_1.getMyCardsSchema), paymentmethodcard_controller_1.getMyCards);
/**
 * GET /api/payment-cards/stats
 * Obtener estadísticas de tarjetas del usuario
 * Acceso: Todos los roles autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), paymentmethodcard_controller_1.getCardStats);
/**
 * DELETE /api/payment-cards/clean-expired
 * Limpiar tarjetas expiradas del usuario
 * Acceso: Todos los roles autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.delete('/clean-expired', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), paymentmethodcard_controller_1.cleanExpiredCards);
/**
 * GET /api/payment-cards/:id
 * Obtener una tarjeta específica por ID
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodcard_validation_1.getPaymentMethodCardByIdSchema), paymentmethodcard_controller_1.getCardById);
/**
 * POST /api/payment-cards/:id/validate
 * Validar si una tarjeta es válida para usar en pago
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.post('/:id/validate', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodcard_validation_1.getPaymentMethodCardByIdSchema), paymentmethodcard_controller_1.validateCard);
/**
 * DELETE /api/payment-cards/:id
 * Eliminar una tarjeta
 * Acceso: Todos los roles autenticados (solo el dueño)
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodcard_validation_1.deletePaymentMethodCardSchema), paymentmethodcard_controller_1.deleteCard);
exports.default = router;
