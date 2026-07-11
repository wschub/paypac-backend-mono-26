"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentmethodsui_controller_1 = require("../controllers/paymentmethodsui.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const paymentmethodsui_validation_1 = require("../validators/paymentmethodsui.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/payment-methods
 * Crear un nuevo método de pago
 * Requiere: PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(paymentmethodsui_validation_1.createPaymentMethodUISchema), paymentmethodsui_controller_1.createPaymentMethod);
/**
 * GET /api/payment-methods
 * Listar todos los métodos de pago (con filtros opcionales)
 * Acceso: Todos los roles autenticados
 *
 * Query params opcionales:
 * - method_status: 0 (inactivos) | 1 (activos)
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), paymentmethodsui_controller_1.getPaymentMethods);
/**
 * GET /api/payment-methods/active
 * Listar solo métodos de pago activos
 * Acceso: Todos los roles autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get('/active', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), paymentmethodsui_controller_1.getActivePaymentMethods);
/**
 * GET /api/payment-methods/stats
 * Obtener estadísticas de métodos de pago
 * Requiere: PAYPAC
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), paymentmethodsui_controller_1.getPaymentMethodsStats);
/**
 * GET /api/payment-methods/:id
 * Obtener un método de pago específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(paymentmethodsui_validation_1.getPaymentMethodUIByIdSchema), paymentmethodsui_controller_1.getPaymentMethodById);
/**
 * PUT /api/payment-methods/:id
 * Actualizar un método de pago completo
 * Requiere: PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(paymentmethodsui_validation_1.updatePaymentMethodUISchema), paymentmethodsui_controller_1.updatePaymentMethod);
/**
 * PATCH /api/payment-methods/:id/status
 * Actualizar solo el status del método de pago
 * Requiere: PAYPAC
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(paymentmethodsui_validation_1.updatePaymentMethodUIStatusSchema), paymentmethodsui_controller_1.updatePaymentMethodStatus);
/**
 * DELETE /api/payment-methods/:id
 * Eliminar un método de pago
 * Requiere: PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(paymentmethodsui_validation_1.getPaymentMethodUIByIdSchema), paymentmethodsui_controller_1.deletePaymentMethod);
exports.default = router;
