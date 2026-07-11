"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventdcto_controller_1 = require("../controllers/eventdcto.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventdcto_validation_1 = require("../validators/eventdcto.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/events/:eventId/discounts
 * Crear un nuevo descuento para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post('/events/:eventId/discounts', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.createDiscountSchema), eventdcto_controller_1.createDiscount);
/**
 * GET /api/events/:eventId/discounts
 * Obtener todos los descuentos de un evento
 * Acceso: Todos los roles autenticados
 */
router.get('/events/:eventId/discounts', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.getDiscountsByEventIdSchema), eventdcto_controller_1.getDiscountsByEventId);
/**
 * GET /api/events/:eventId/discounts/applicable
 * Obtener descuentos aplicables para una cantidad de tickets
 * Acceso: Todos los roles autenticados
 *
 * Query params:
 * - quantity: number (requerido)
 * - locality_id: number (opcional)
 */
router.get('/events/:eventId/discounts/applicable', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.getApplicableDiscountsSchema), eventdcto_controller_1.getApplicableDiscounts);
/**
 * POST /api/discounts/validate
 * Validar un código de descuento
 * Acceso: Todos los roles autenticados
 *
 * Body:
 * - event_id: number
 * - discount_name: string
 * - quantity: number
 * - locality_id?: number
 */
router.post('/discounts/validate', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.validateDiscountSchema), eventdcto_controller_1.validateDiscount);
/**
 * POST /api/discounts/calculate
 * Calcular monto de descuento
 * Acceso: Todos los roles autenticados
 *
 * Body:
 * - total_amount: number
 * - discount_type: number (1: Porcentaje, 2: Monto fijo)
 * - discount_value: number
 */
router.post('/discounts/calculate', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.calculateDiscountSchema), eventdcto_controller_1.calculateDiscount);
/**
 * GET /api/discounts/:id
 * Obtener un descuento específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/discounts/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.getDiscountByIdSchema), eventdcto_controller_1.getDiscountById);
/**
 * PUT /api/discounts/:id
 * Actualizar un descuento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put('/discounts/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.updateDiscountSchema), eventdcto_controller_1.updateDiscount);
//NEW
/**
 * PATCH /api/events/:eventId/discounts/:id/toggle
 * Activar/desactivar código de descuento
 * Acceso: ORGANIZER dueño o PAYPAC
 */
router.patch('/:eventId/discounts/:id/toggle', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), eventdcto_controller_1.toggleDiscount);
/**
 * DELETE /api/discounts/:id
 * Eliminar un descuento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete('/discounts/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventdcto_validation_1.getDiscountByIdSchema), eventdcto_controller_1.deleteDiscount);
exports.default = router;
