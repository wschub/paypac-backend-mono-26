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
exports.bulkUpsertPermissions = exports.deletePermission = exports.getPermissionByRoleAndSection = exports.getPermissionsByRole = exports.upsertPermission = void 0;
const role_section_permission_service_1 = require("../services/role_section_permission.service");
const permService = new role_section_permission_service_1.RoleSectionPermissionService();
const upsertPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield permService.upsertPermission(req.body, req.user.role);
        res.status(200).json({ message: 'Permiso actualizado exitosamente', permission: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.upsertPermission = upsertPermission;
const getPermissionsByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.params.role;
        const perms = yield permService.getPermissionsByRole(role, req.user.role);
        res.status(200).json({ total: perms.length, permissions: perms });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.getPermissionsByRole = getPermissionsByRole;
const getPermissionByRoleAndSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.params.role;
        const section_id = Number(req.params.sectionId);
        const perm = yield permService.getPermissionByRoleAndSection(role, section_id, req.user.role);
        res.status(200).json(perm);
    }
    catch (err) {
        const status = err.message.includes('no encontrado') ? 404
            : err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.getPermissionByRoleAndSection = getPermissionByRoleAndSection;
const deletePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.params.role;
        const section_id = Number(req.params.sectionId);
        yield permService.deletePermission(role, section_id, req.user.role);
        res.status(200).json({ message: 'Permiso eliminado exitosamente' });
    }
    catch (err) {
        const status = err.message.includes('no encontrado') ? 404
            : err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.deletePermission = deletePermission;
const bulkUpsertPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section_id = Number(req.params.sectionId);
        const { permissions } = req.body;
        const result = yield permService.bulkUpsert(section_id, permissions, req.user.role);
        res.status(200).json({ message: 'Permisos actualizados exitosamente', permissions: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.bulkUpsertPermissions = bulkUpsertPermissions;
