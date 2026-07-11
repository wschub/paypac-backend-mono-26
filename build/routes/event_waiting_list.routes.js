"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_waiting_list_controller_1 = require("../controllers/event_waiting_list.controller");
const event_waiting_list_validation_1 = require("../validators/event_waiting_list.validation");
const router = (0, express_1.Router)();
// POST /api/waiting-list — registro desde la app (usuario autenticado)
router.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)(event_waiting_list_validation_1.registerWaitingListAuthSchema), event_waiting_list_controller_1.registerWaitingListAuthenticated);
// GET /api/waiting-list/event/:eventId
router.get('/event/:eventId', auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)(event_waiting_list_validation_1.eventIdParamSchema), event_waiting_list_controller_1.getWaitingListByEvent);
// GET /api/waiting-list/locality/:localityId
router.get('/locality/:localityId', auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)(event_waiting_list_validation_1.localityIdParamSchema), event_waiting_list_controller_1.getWaitingListByLocality);
// DELETE /api/waiting-list/:id
router.delete('/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validateRequest)(event_waiting_list_validation_1.waitingListIdParamSchema), event_waiting_list_controller_1.removeFromWaitingList);
exports.default = router;
