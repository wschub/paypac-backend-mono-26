"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const user_validation_1 = require("../validators/user.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
/**
 * POST /auth/register
 * Solo admins pueden registrar nuevos usuarios
 * El frontend ya NO llama a este endpoint para auto-registro
 */
router.post('/register', 
//authenticate,                          // ← Usuario debe estar autenticado
//authorizeRoles('PAYPAC','ORGANIZER'),               // ← Solo admins
(0, validate_middleware_1.validateRequest)(user_validation_1.registerUserSchema), auth_controller_1.register);
/*Creación por parte de los usuarios admin
PAYPAC, ORGANIZER
*/
router.post('/new-user', auth_middleware_1.authenticate, // ← Usuario debe estar autenticado
(0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), // ← Solo admins
(0, validate_middleware_1.validateRequest)(user_validation_1.registerUserSchema), auth_controller_1.register);
/**
 * POST /auth/login
 * ❌ ELIMINAR - Firebase maneja login en el frontend
 * El frontend usa: signInWithEmailAndPassword() de Firebase
 */
// router.post('/login', validateRequest(loginUserSchema), login);
/**
 * GET /auth/me
 * Obtener perfil del usuario autenticado
 * Reemplaza la necesidad de /login para verificar autenticación
 */
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getProfile);
/**
 * GET /auth/users
 * Listar usuarios (solo admin)
 */
router.get('/users', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(user_validation_1.getUsersSchema), auth_controller_1.getUsers);
/**
 * POST /auth/verify-email
 * Verificar email con código OTP — requiere autenticación Firebase
 */
router.post('/verify-email', auth_middleware_1.authenticate, auth_controller_1.verifyEmailCode);
/**
 * POST /auth/resend-verification
 * Reenviar OTP de verificación de email — requiere autenticación Firebase
 */
router.post('/resend-verification', auth_middleware_1.authenticate, auth_controller_1.resendVerification);
/**
 * DELETE /auth/account
 * Eliminar cuenta del usuario autenticado (cumplimiento Google Play Store)
 */
router.delete('/account', auth_middleware_1.authenticate, auth_controller_1.deleteAccount);
exports.default = router;
