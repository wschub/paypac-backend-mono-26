"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promoter_code_controller_1 = require("../controllers/promoter_code.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const promoter_code_validation_1 = require("../validators/promoter_code.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/promoter-codes/my-code
 * Obtener mi código de promotor — ANTES de /:id
 */
router.get('/my-code', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER'), promoter_code_controller_1.getMyCode);
/**
 * GET /api/promoter-codes/my-stats
 * Estadísticas de ventas del promotor autenticado
 */
router.get('/my-stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER'), promoter_code_controller_1.getMyStats);
/**
 * GET /api/promoter-codes/validate/:code
 * Validar código al momento de la compra — todos los roles autenticados
 * Usado por el checkout en la app del cliente
 */
router.get('/validate/:code', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'PROMOTER', 'CUSTOMER', 'STAFF', 'STAFF_PROMOTER'), (0, validate_middleware_1.validateRequest)(promoter_code_validation_1.codeParamSchema), promoter_code_controller_1.validateCode);
/**
 * POST /api/promoter-codes
 * Crear mi código de promotor
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(promoter_code_validation_1.createCodeSchema), promoter_code_controller_1.createMyCode);
/**
 * GET /api/promoter-codes
 * Listar todos los códigos — PAYPAC only
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), promoter_code_controller_1.getAllCodes);
/**
 * PATCH /api/promoter-codes/:id/toggle
 * Activar/desactivar código — PAYPAC only
 */
router.patch('/:id/toggle', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(promoter_code_validation_1.idParamSchema), promoter_code_controller_1.toggleActive);
/**
 * DELETE /api/promoter-codes/:id
 * Eliminar código — PAYPAC only
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(promoter_code_validation_1.idParamSchema), promoter_code_controller_1.deleteCode);
exports.default = router;
