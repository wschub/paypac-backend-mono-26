"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const web_sections_controller_1 = require("../controllers/web_sections.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
const paypacOnly = [auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC')];
const anyAuth = [auth_middleware_1.authenticate];
// ── Types ──────────────────────────────────────────────────────────────────────
router.get('/types', ...anyAuth, web_sections_controller_1.getTypes);
router.post('/types', ...paypacOnly, web_sections_controller_1.createType);
router.put('/types/:id', ...paypacOnly, web_sections_controller_1.updateType);
router.delete('/types/:id', ...paypacOnly, web_sections_controller_1.deleteType);
// ── Groups ─────────────────────────────────────────────────────────────────────
router.get('/groups', ...anyAuth, web_sections_controller_1.getGroups);
router.get('/groups/:id', ...anyAuth, web_sections_controller_1.getGroupById);
router.post('/groups', ...paypacOnly, web_sections_controller_1.createGroup);
router.put('/groups/:id', ...paypacOnly, web_sections_controller_1.updateGroup);
router.delete('/groups/:id', ...paypacOnly, web_sections_controller_1.deleteGroup);
// ── Sections ───────────────────────────────────────────────────────────────────
router.get('/', ...anyAuth, web_sections_controller_1.getSections);
router.get('/:id', ...anyAuth, web_sections_controller_1.getSectionById);
router.post('/', ...paypacOnly, web_sections_controller_1.createSection);
router.put('/:id', ...paypacOnly, web_sections_controller_1.updateSection);
router.delete('/:id', ...paypacOnly, web_sections_controller_1.deleteSection);
exports.default = router;
