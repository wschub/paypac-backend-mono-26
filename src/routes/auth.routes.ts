import { Router } from 'express';
import { register, getUsers, getProfile } from '../controllers/auth.controller';
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
  authorizeRoles('admin'),
  validateRequest(getUsersSchema),
  getUsers
);

export default router;