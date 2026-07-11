"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generalsettings_controller_1 = require("../controllers/generalsettings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const generalsettings_validation_1 = require("../validators/generalsettings.validation");
const router = (0, express_1.Router)();
/**
 * Todas las rutas de este módulo son exclusivas de PAYPAC
 */
/**
 * GET /api/settings
 * Listar todas las variables (?search= opcional)
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.getSettingsQuerySchema), generalsettings_controller_1.getSettings);
/**
 * GET /api/settings/by-name/:name
 * Obtener variable por su clave única (ej: MAX_TICKETS_PER_USER)
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-name/:name', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.getSettingByNameSchema), generalsettings_controller_1.getSettingByName);
/**
 * GET /api/settings/:id
 * Obtener variable por ID
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.getSettingByIdSchema), generalsettings_controller_1.getSettingById);
/**
 * POST /api/settings
 * Crear nueva variable de configuración
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.createSettingSchema), generalsettings_controller_1.createSetting);
/**
 * PUT /api/settings/:id
 * Actualizar variable de configuración
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.updateSettingSchema), generalsettings_controller_1.updateSetting);
/**
 * DELETE /api/settings/:id
 * Eliminar variable de configuración
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(generalsettings_validation_1.getSettingByIdSchema), generalsettings_controller_1.deleteSetting);
exports.default = router;
