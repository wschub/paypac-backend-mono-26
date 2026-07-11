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
exports.RoleSectionPermissionService = void 0;
const role_section_permission_repository_1 = require("../repositories/role_section_permission.repository");
const section_repository_1 = require("../repositories/section.repository");
const permRepo = new role_section_permission_repository_1.RoleSectionPermissionRepository();
const sectionRepo = new section_repository_1.SectionRepository();
const VALID_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
class RoleSectionPermissionService {
    upsertPermission(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede gestionar permisos');
            const section = yield sectionRepo.findById(data.section_id);
            if (!section)
                throw new Error('Sección no encontrada');
            if (!VALID_ROLES.includes(data.role))
                throw new Error('Rol inválido');
            return permRepo.upsert(data);
        });
    }
    getPermissionsByRole(role, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver los permisos');
            if (!VALID_ROLES.includes(role))
                throw new Error('Rol inválido');
            return permRepo.findByRole(role);
        });
    }
    getPermissionByRoleAndSection(role, section_id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver los permisos');
            const perm = yield permRepo.findByRoleAndSection(role, section_id);
            if (!perm)
                throw new Error('Permiso no encontrado');
            return perm;
        });
    }
    deletePermission(role, section_id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar permisos');
            const perm = yield permRepo.findByRoleAndSection(role, section_id);
            if (!perm)
                throw new Error('Permiso no encontrado');
            return permRepo.delete(role, section_id);
        });
    }
    bulkUpsert(section_id, permissions, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede gestionar permisos');
            const section = yield sectionRepo.findById(section_id);
            if (!section)
                throw new Error('Sección no encontrada');
            const invalidRole = permissions.find(p => !VALID_ROLES.includes(p.role));
            if (invalidRole)
                throw new Error(`Rol inválido: ${invalidRole.role}`);
            return permRepo.bulkUpsert(section_id, permissions);
        });
    }
}
exports.RoleSectionPermissionService = RoleSectionPermissionService;
