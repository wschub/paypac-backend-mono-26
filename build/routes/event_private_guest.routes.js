"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const event_private_guest_controller_1 = require("../controllers/event_private_guest.controller");
const router = (0, express_1.Router)({ mergeParams: true });
const staff = (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER');
// POST   /api/events/:eventId/guest-list          → invitar
// GET    /api/events/:eventId/guest-list          → listar
// PATCH  /api/events/:eventId/guest-list/:guestId/confirm → confirmar
// PATCH  /api/events/:eventId/guest-list/:guestId/reject  → rechazar
// DELETE /api/events/:eventId/guest-list/:guestId         → eliminar
router.post('/', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.inviteGuest);
router.post('/bulk', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.bulkInviteGuests);
router.get('/', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.getGuests);
router.patch('/:guestId/confirm', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.confirmGuest);
router.patch('/:guestId/reject', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.rejectGuest);
router.delete('/:guestId', auth_middleware_1.authenticate, staff, event_private_guest_controller_1.removeGuest);
exports.default = router;
