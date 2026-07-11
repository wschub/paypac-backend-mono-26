"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticatePublicWeb_1 = require("../../middlewares/authenticatePublicWeb");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const event_waiting_list_controller_1 = require("../../controllers/public/event_waiting_list.controller");
const event_waiting_list_validation_1 = require("../../validators/event_waiting_list.validation");
const router = (0, express_1.Router)();
// POST /api/public/waiting-list
router.post('/', authenticatePublicWeb_1.authenticatePublicWeb, (0, validate_middleware_1.validateRequest)(event_waiting_list_validation_1.registerWaitingListSchema), event_waiting_list_controller_1.registerWaitingList);
exports.default = router;
