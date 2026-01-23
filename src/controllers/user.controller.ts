import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
const userService = new UserService();
import { paramToString } from '../utils/utils';


/**
 * GET /api/users
 * Listar usuarios (filtrado por rol)
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const users = await userService.getUsers(user.role, user.id, user.company_id || undefined);

    res.status(200).json({
      total: users.length,
      users,
    });
  } catch (err: any) {
    console.error('❌ Error en getUsers:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const foundUser = await userService.getUserById(id, user.id, user.role);

    res.status(200).json(foundUser);
  } catch (err: any) {
    console.error('❌ Error en getUserById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/users/me/profile
 * Obtener perfil del usuario autenticado
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const profile = await userService.getMyProfile(user.id);

    res.status(200).json(profile);
  } catch (err: any) {
    console.error('❌ Error en getMyProfile:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const data = req.body;

    const updatedUser = await userService.updateUser(id, data, user.id, user.role);

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('❌ Error en updateUser:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/users/:id
 * Eliminar usuario (solo PAYPAC)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);

    await userService.deleteUser(id, user.role);

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteUser:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol (solo PAYPAC)
 */
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const role = paramToString(req.params.role);
    const users = await userService.getUsersByRole(role, user.role);

    res.status(200).json({
      total: users.length,
      users,
    });
  } catch (err: any) {
    console.error('❌ Error en getUsersByRole:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/users/stats/all
 * Obtener estadísticas de usuarios (solo PAYPAC)
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const stats = await userService.getUserStats(user.role);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getUserStats:', err);
    res.status(403).json({ error: err.message });
  }
};