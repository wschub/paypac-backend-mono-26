import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * POST /auth/register
 * Crear usuario (solo admins)
 * Ahora crea en Firebase + PostgreSQL
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, last_name, email, password, role, company_id,phone_number } = req.body;
  
  try {
    // El admin puede especificar company_id, o heredar el suyo
    const finalCompanyId = company_id || req.user?.company_id || null;

    const result = await authService.register({
      name,
      last_name,
      email,
      password,
      role,
      company_id: finalCompanyId,
      phone_number,
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * ❌ login - YA NO SE USA
 * Firebase maneja login en el frontend
 * Puedes comentar o eliminar esta función
 */
// export const login = async (req: Request, res: Response) => { ... };

/**
 * GET /auth/me
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      last_name: user.last_name,
      role: user.role,
      company_id: user.company_id,
      firebase_uid: user.firebase_uid,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

/**
 * GET /auth/users
 * Listar usuarios (solo admin)
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.getUsers();
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};