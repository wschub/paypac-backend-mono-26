"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const userRepo = new user_repository_1.UserRepository();
class UserService {
    /**
     * Obtener todos los usuarios
     * Solo PAYPAC puede ver todos los usuarios
     */
    getUsers(userRole, userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole === 'PAYPAC') {
                return userRepo.findAll();
            }
            // Si es ORGANIZER, solo ve usuarios de su empresa
            if (userRole === 'ORGANIZER' && companyId) {
                return userRepo.findByCompanyId(companyId);
            }
            throw new Error('No tienes permisos para listar usuarios');
        });
    }
    /**
     * Obtener usuario por ID
     */
    getUserById(id, requestingUserId, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepo.findByIdWithRelations(id);
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
        });
    }
    /**
     * Obtener perfil del usuario autenticado
     */
    getMyProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepo.findByIdWithRelations(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        });
    }
    /**
     * Actualizar usuario
     * Solo el propio usuario o PAYPAC pueden actualizar
     */
    updateUser(id, data, requestingUserId, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepo.findById(id);
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
        });
    }
    /**
     * Eliminar usuario
     * Solo PAYPAC puede eliminar usuarios
     */
    deleteUser(id, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requestingUserRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar usuarios');
            }
            const user = yield userRepo.findById(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // TODO: Verificar que no tenga eventos, tickets, transacciones activas
            return userRepo.delete(id);
        });
    }
    /**
     * Obtener usuarios por rol
     */
    getUsersByRole(role, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requestingUserRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede filtrar usuarios por rol');
            }
            return userRepo.findByRole(role);
        });
    }
    /**
     * Estadísticas de usuarios
     */
    getUserStats(requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (requestingUserRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            const allUsers = yield userRepo.findAll();
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
        });
    }
    /**
     * Buscar si existe un usuario para asignarlo como STAFF
     */
    searchUsers(q, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q || q.trim().length < 3)
                throw new Error('El término de búsqueda debe tener al menos 3 caracteres');
            const parsedRoles = roles === null || roles === void 0 ? void 0 : roles.map((r) => r);
            const users = yield userRepo.search(q.trim(), parsedRoles);
            return { users, total: users.length };
        });
    }
}
exports.UserService = UserService;
