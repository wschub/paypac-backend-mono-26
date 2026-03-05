import { UserRepository } from '../repositories/user.repository';
import { Prisma, ROLES, $Enums } from '@prisma/client';


const userRepo = new UserRepository();

export class UserService {
  /**
   * Obtener todos los usuarios
   * Solo PAYPAC puede ver todos los usuarios
   */
  async getUsers(userRole: ROLES, userId?: number, companyId?: number) {
    if (userRole === 'PAYPAC') {
      return userRepo.findAll();
    }

    // Si es ORGANIZER, solo ve usuarios de su empresa
    if (userRole === 'ORGANIZER' && companyId) {
      return userRepo.findByCompanyId(companyId);
    }

    throw new Error('No tienes permisos para listar usuarios');
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: number, requestingUserId: number, requestingUserRole: ROLES) {
    const user = await userRepo.findByIdWithRelations(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // PAYPAC puede ver cualquier usuario
    if (requestingUserRole === 'PAYPAC') {
      return user;
    }

    // Los usuarios solo pueden ver su propio perfil o usuarios de su empresa
    if (requestingUserId === id) {
      return user;
    }

    // Si es de la misma empresa, puede verlo
    if (user.company_id && user.company_id === requestingUserId) {
      return user;
    }

    throw new Error('No tienes permisos para ver este usuario');
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getMyProfile(userId: number) {
    const user = await userRepo.findByIdWithRelations(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  /**
   * Actualizar usuario
   * Solo el propio usuario o PAYPAC pueden actualizar
   */
  async updateUser(
    id: number,
    data: Prisma.UserUpdateInput,
    requestingUserId: number,
    requestingUserRole: ROLES
  ) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Solo el propio usuario o PAYPAC pueden actualizar
    const canUpdate = requestingUserId === id || requestingUserRole === 'PAYPAC';

    if (!canUpdate) {
      throw new Error('No tienes permisos para actualizar este usuario');
    }

    // No permitir cambiar el rol si no es PAYPAC
    if (data.role && requestingUserRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede cambiar roles de usuario');
    }

    return userRepo.update(id, data);
  }

  /**
   * Eliminar usuario
   * Solo PAYPAC puede eliminar usuarios
   */
  async deleteUser(id: number, requestingUserRole: ROLES) {
    if (requestingUserRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar usuarios');
    }

    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // TODO: Verificar que no tenga eventos, tickets, transacciones activas

    return userRepo.delete(id);
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(role: ROLES, requestingUserRole: string) {
    if (requestingUserRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede filtrar usuarios por rol');
    }

    return userRepo.findByRole(role);
  }

  /**
   * Estadísticas de usuarios
   */
  async getUserStats(requestingUserRole: ROLES) {
    if (requestingUserRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const allUsers = await userRepo.findAll();

    const stats = {
      total_users: allUsers.length,
      by_role: {
        PAYPAC: allUsers.filter(u => u.role === 'PAYPAC').length,
        ORGANIZER: allUsers.filter(u => u.role === 'ORGANIZER').length,
        STAFF: allUsers.filter(u => u.role === 'STAFF').length,
        STAFF_PROMOTER: allUsers.filter(u => u.role === 'STAFF_PROMOTER').length,
        PROMOTER: allUsers.filter(u => u.role === 'PROMOTER').length,
        CUSTOMER: allUsers.filter(u => u.role === 'CUSTOMER').length,
      },
      verified_users: allUsers.filter(u => u.verified_user === 1).length,
      active_users: allUsers.filter(u => u.status === 1).length,
    };

    return stats;
  }

  /**
   * Buscar si existe un usuario para asignarlo como STAFF
   */
  async searchUsers(q: string, roles?: string[]) {
  if (!q || q.trim().length < 3)
    throw new Error('El término de búsqueda debe tener al menos 3 caracteres');

  const parsedRoles = roles?.map((r) => r as $Enums.ROLES);

  const users = await userRepo.search(q.trim(), parsedRoles);

  return { users, total: users.length };
}

}