import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * POST /auth/register (Público)
 * POST /auth/new-user (Protegido)
 * 
 * Crear usuario:
 * - /register: Auto-registro de CUSTOMER (sin autenticación)
 * - /new-user: PAYPAC/ORGANIZER crean staff/promotores (con autenticación)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, last_name, email, password, role, company_id, phone_number, source } = req.body;

  try {
    // Determinar si es auto-registro o creación por admin
    const isAdminCreation = !!req.user; // Si req.user existe, es admin autenticado

    let finalCompanyId: number | null = null;
    let createdBy: { userId: number; userRole: string } | undefined = undefined;

    if (isAdminCreation) {
      // ✅ Creación por admin (endpoint /new-user)
      finalCompanyId = company_id || req.user?.company_id || null;
      createdBy = {
        userId: req.user!.id,
        userRole: req.user!.role,
      };

      console.log(`👤 Admin ${createdBy.userRole} (ID: ${createdBy.userId}) creando usuario`);
    } else {
      // ✅ Auto-registro (endpoint /register)
      // Para CUSTOMER no es obligatorio company_id
      finalCompanyId = null;

      console.log('👤 Auto-registro de nuevo usuario');
    }

    const result = await authService.register(
      {
        name,
        last_name,
        email,
        password,
        role,
        company_id: finalCompanyId,
        phone_number,
        source,
      },
      createdBy
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

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

/**
 * POST /auth/verify-email
 * 12.1 — Verificar email desde la app con código OTP (requiere autenticación)
 */
export const verifyEmailApp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ message: 'Código requerido' });
      return;
    }
    await authService.verifyEmailApp(req.user!.id, code);
    res.status(201).json({ message: 'Email verificado exitosamente' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /auth/verify-email/web?token=xxx
 * 12.2 — Verificar email desde la web con token JWT (público)
 */
export const verifyEmailWeb = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Token requerido' });
      return;
    }
    await authService.verifyEmailWeb(token);
    res.status(200).json({ message: 'Email verificado exitosamente' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};