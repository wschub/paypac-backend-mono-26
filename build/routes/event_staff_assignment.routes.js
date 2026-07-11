"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_staff_assignment_controller_1 = require("../controllers/event_staff_assignment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_staff_assignment_validation_1 = require("../validators/event_staff_assignment.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/staff/my-next-event
 * Obtener el próximo evento asignado y habilitado a partir de fecha chec-in
 *  al STAFF autenticado
 * Requiere: STAFF, STAFF_PROMOTER
 *
 * NOTA: Esta ruta debe registrarse ANTES que las rutas de /api/events
 */
router.get('/my-next-event', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('STAFF', 'STAFF_PROMOTER', 'PAYPAC'), event_staff_assignment_controller_1.getMyNextEvent);
/* Muestra progreso tickets check-ins*/
router.get('/:eventId/checkin-stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('STAFF', 'STAFF_PROMOTER', 'ORGANIZER', 'PAYPAC'), event_staff_assignment_controller_1.getEventCheckinStats);
/**
 * GET /api/staff/my-events
 * Obtener eventos asignados al STAFF autenticado
 * Requiere: STAFF, STAFF_PROMOTER
 *
 * NOTA: Esta ruta debe registrarse ANTES que las rutas de /api/events
 */
router.get('/my-events', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('STAFF', 'STAFF_PROMOTER', 'PAYPAC'), event_staff_assignment_controller_1.getMyAssignedEvents);
/**
 * POST /api/events/:eventId/staff
 * Asignar staff existente o invitar uno nuevo (?invite=true)
 * Requiere: ORGANIZER o PAYPAC
 */
/** */
router.post('/:eventId/staff', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (req, res, next) => {
    const schema = req.query.invite === 'true' ? event_staff_assignment_validation_1.inviteStaffSchema : event_staff_assignment_validation_1.assignStaffSchema;
    (0, validate_middleware_1.validateRequest)(schema)(req, res, next);
}, (req, res) => {
    if (req.query.invite === 'true') {
        return (0, event_staff_assignment_controller_1.inviteStaffToEvent)(req, res);
    }
    return (0, event_staff_assignment_controller_1.assignStaffToEvent)(req, res);
});
/**
 * POST /api/events/:eventId/staff
 * Asignar un STAFF a un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.post('/:eventId/staff', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.assignStaffSchema), event_staff_assignment_controller_1.assignStaffToEvent);
/**
 * GET /api/events/:eventId/staff
 * Obtener todos los STAFF asignados a un evento
 * Requiere: ORGANIZER (dueño), STAFF del evento, o PAYPAC
 */
router.get('/:eventId/staff', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.getEventStaffSchema), event_staff_assignment_controller_1.getEventStaff);
/**
 * GET /api/events/:eventId/staff/stats
 * Obtener estadísticas de STAFF del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/:eventId/staff/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.getStaffStatsSchema), event_staff_assignment_controller_1.getEventStaffStats);
/**
 * POST /api/events/:eventId/staff/check-in
 * Check-in del STAFF en el evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
router.post('/:eventId/staff/check-in', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('STAFF', 'STAFF_PROMOTER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.checkInStaffSchema), event_staff_assignment_controller_1.checkInStaff);
/**
 * POST /api/events/:eventId/staff/check-out
 * Check-out del STAFF del evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
router.post('/:eventId/staff/check-out', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('STAFF', 'STAFF_PROMOTER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.checkOutStaffSchema), event_staff_assignment_controller_1.checkOutStaff);
/**
 * DELETE /api/events/:eventId/staff/:staffUserId
 * Remover un STAFF de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.delete('/:eventId/staff/:staffUserId', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(event_staff_assignment_validation_1.removeStaffSchema), event_staff_assignment_controller_1.removeStaffFromEvent);
exports.default = router;
