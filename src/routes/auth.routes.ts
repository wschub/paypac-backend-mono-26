import { Router } from 'express';
import { register, getUsers, getProfile, verifyEmailApp, verifyEmailWeb } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerUserSchema, getUsersSchema } from '../validators/user.validation';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * POST /auth/register
 * Solo admins pueden registrar nuevos usuarios
 * El frontend ya NO llama a este endpoint para auto-registro
 */
router.post(
  '/register',
  //authenticate,                          // ← Usuario debe estar autenticado
  //authorizeRoles('PAYPAC','ORGANIZER'),               // ← Solo admins
  validateRequest(registerUserSchema),
  register
);

/*Creación por parte de los usuarios admin
PAYPAC, ORGANIZER
*/
router.post(
  '/new-user',
  authenticate,                          // ← Usuario debe estar autenticado
  authorizeRoles('PAYPAC','ORGANIZER'),               // ← Solo admins
  validateRequest(registerUserSchema),
  register
);

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
router.get('/me', authenticate, getProfile);

/**
 * GET /auth/users
 * Listar usuarios (solo admin)
 */
router.get(
  '/users',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getUsersSchema),
  getUsers
);

/**
 * POST /auth/verify-email
 * 12.1 — Verificar OTP de email (app, requiere autenticación Firebase)
 */
router.post('/verify-email', authenticate, verifyEmailApp);

/**
 * GET /auth/verify-email/web?token=xxx
 * 12.2 — Verificar email vía JWT link (web, público)
 */
router.get('/verify-email/web', verifyEmailWeb);

export default router;