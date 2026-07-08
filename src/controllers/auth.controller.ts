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
  const {
    name, last_name, email, password, role, company_id, phone_number, source,
    num_doc, type_doc, birth_date, lang_user, country_id, gender, social_token,
  } = req.body;

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
        num_doc,
        type_doc,
        birth_date: birth_date ? new Date(birth_date) : undefined,
        lang_user,
        country_id,
        gender,
        social_token,
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
      phone_number: user.phone_number,
      num_doc: user.num_doc,
      type_doc: user.type_doc,
      role: user.role,
      company_id: user.company_id,
      firebase_uid: user.firebase_uid,
      verified_user: user.verified_user,
      email_verified_at: user.email_verified_at,
      phone_number_verified_at: user.phone_number_verified_at,
      birth_date: user.birth_date,
      gender: user.gender,
      country_id: user.country_id,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

/**
 * DELETE /auth/account
 * Eliminar cuenta del usuario autenticado (cumplimiento Google Play Store)
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.deleteAccount(req.user!.id, req.user!.firebase_uid!);
    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /auth/resend-verification
 * Reenviar código OTP de verificación de email (app)
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.resendVerificationEmail(req.user!.id);
    res.json({ message: 'Código reenviado a tu email' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /auth/verify-email
 * Verificar email con código OTP — app (código manual) y web (código desde URL)
 */
export const verifyEmailCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ message: 'Código requerido' });
      return;
    }
    await authService.verifyEmailCode(req.user!.id, code);
    res.status(201).json({ message: 'Email verificado exitosamente' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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
