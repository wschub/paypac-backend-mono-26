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
exports.searchUsers = exports.getUserStats = exports.getUsersByRole = exports.deleteUser = exports.updateUser = exports.getMyProfile = exports.getUserById = exports.getUsers = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
const utils_1 = require("../utils/utils");
/**
 * GET /api/users
 * Listar usuarios (filtrado por rol)
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const users = yield userService.getUsers(user.role, user.id, user.company_id || undefined);
        res.status(200).json({
            total: users.length,
            users,
        });
    }
    catch (err) {
        console.error('❌ Error en getUsers:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getUsers = getUsers;
/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const foundUser = yield userService.getUserById(id, user.id, user.role);
        res.status(200).json(foundUser);
    }
    catch (err) {
        console.error('❌ Error en getUserById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getUserById = getUserById;
/**
 * GET /api/users/me/profile
 * Obtener perfil del usuario autenticado
 */
const getMyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const profile = yield userService.getMyProfile(user.id);
        res.status(200).json(profile);
    }
    catch (err) {
        console.error('❌ Error en getMyProfile:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getMyProfile = getMyProfile;
/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        const updatedUser = yield userService.updateUser(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser,
        });
    }
    catch (err) {
        console.error('❌ Error en updateUser:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateUser = updateUser;
/**
 * DELETE /api/users/:id
 * Eliminar usuario (solo PAYPAC)
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield userService.deleteUser(id, user.role);
        res.status(200).json({
            message: 'Usuario eliminado exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteUser:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteUser = deleteUser;
/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol (solo PAYPAC)
 */
const getUsersByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const role = (0, utils_1.paramToString)(req.params.role);
        const users = yield userService.getUsersByRole(role, user.role);
        res.status(200).json({
            total: users.length,
            users,
        });
    }
    catch (err) {
        console.error('❌ Error en getUsersByRole:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getUsersByRole = getUsersByRole;
/**
 * GET /api/users/stats/all
 * Obtener estadísticas de usuarios (solo PAYPAC)
 */
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const stats = yield userService.getUserStats(user.role);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getUserStats:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getUserStats = getUserStats;
/**
  * Buscar si existe un usuario para asignarlo como STAFF
  */
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const q = req.query.q;
        const roles = req.query.role
            ? req.query.role.split(',').map((r) => r.trim())
            : undefined;
        const result = yield userService.searchUsers(q, roles);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.searchUsers = searchUsers;
