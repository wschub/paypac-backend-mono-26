"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_validation_1 = require("../validators/event.validation");
const eventViews_controller_1 = require("../controllers/eventViews.controller");
const eventViews_validation_1 = require("../validators/eventViews.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/events
 * Crear un nuevo evento
 * Requiere: ORGANIZER o PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_validation_1.createEventSchema), event_controller_1.createEvent);
/**
 * GET /api/events
 * Listar todos los eventos (con filtros)
 * Acceso: Todos los roles autenticados
 *
 * Query params opcionales:
 * - status: CREATED | APPROVED | SCHEDULED | ACTIVE | CANCELED | RE_SCHEDULED | FINALIZED
 *           Soporta múltiples separados por coma: status=ACTIVE,APPROVED
 * - event_type: PUBLICO | PRIVADO
 * - category_id: number
 * - subcategory_id: number
 * - subgenre_id: number
 * - country: string
 * - city: string
 * - search: string (busca en name, description, short_description)
 * - date_from: ISO datetime — eventos desde esta fecha (ej: 2026-03-01T00:00:00.000Z)
 * - date_to: ISO datetime — eventos hasta esta fecha (ej: 2026-12-31T23:59:59.000Z)
 * - latitude: string — latitud del usuario (para futura búsqueda por proximidad)
 * - longitude: string — longitud del usuario (para futura búsqueda por proximidad)
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(event_validation_1.getEventsQuerySchema), event_controller_1.getEvents);
/**
 * GET /api/events/my-events
 * Obtener eventos del organizador autenticado
 * Requiere: ORGANIZER
 *
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get('/my-events', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), event_controller_1.getMyEvents);
/**
 * GET /api/events/organizer/stats
 * Obtener estadísticas de eventos del organizador
 * Requiere: ORGANIZER
 */
router.get('/organizer/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), event_controller_1.getOrganizerStats);
/**
 * GET /api/events/promoter-available
 * Eventos con allow_external_promoters=true + resumen de ventas del promotor
 * Requiere: PROMOTER o STAFF_PROMOTER
 *
 * NOTA: Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get('/promoter-available', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER', 'STAFF_PROMOTER', 'ORGANIZER'), event_controller_1.getAvailableEventsForPromoter);
/**
 * GET /api/events/:id
 * Obtener un evento específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(event_validation_1.getEventByIdSchema), event_controller_1.getEventById);
/**
 * PUT /api/events/:id
 * Actualizar un evento completo
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_validation_1.updateEventSchema), event_controller_1.updateEvent);
/**
 * PATCH /api/events/:id/status
 * Actualizar solo el status del evento (aprobar, rechazar, cancelar, etc.)
 * Requiere: PAYPAC
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(event_validation_1.updateEventStatusSchema), event_controller_1.updateEventStatus);
/**
 * DELETE /api/events/:id
 * Eliminar un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_validation_1.getEventByIdSchema), event_controller_1.deleteEvent);
router.post('/:id/view/conversion', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventViews_validation_1.markConversionSchema), eventViews_controller_1.markEventViewConversion);
exports.default = router;
