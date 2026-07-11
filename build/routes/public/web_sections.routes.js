"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const web_sections_controller_1 = require("../../controllers/web_sections.controller");
const router = (0, express_1.Router)();
// GET /api/public/web-sections?lang=ES  → todos los grupos con secciones anidadas
router.get('/', web_sections_controller_1.getPublicNav);
// GET /api/public/web-sections/by-url/:url → sección individual por menu_url
router.get('/by-url/:url', web_sections_controller_1.getPublicSectionByUrl);
exports.default = router;
