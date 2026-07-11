"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countries_controller_1 = require("../../controllers/countries.controller");
const router = (0, express_1.Router)();
/**
 * GET /api/public/countries
 * Lista de países para formularios públicos (registro, selección de idioma, etc.)
 * Acceso: sin autenticación
 */
router.get('/', countries_controller_1.getCountries);
exports.default = router;
