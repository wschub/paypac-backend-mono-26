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
exports.RoleSectionPermissionRepository = void 0;
const db_1 = require("../config/db");
class RoleSectionPermissionRepository {
    upsert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            return db_1.prisma.roleSectionPermission.upsert({
                where: { role_section_id: { role: data.role, section_id: data.section_id } },
                update: {
                    can_view: data.can_view,
                    can_create: data.can_create,
                    can_edit: data.can_edit,
                    can_delete: data.can_delete,
                    can_export: data.can_export,
                },
                create: {
                    role: data.role,
                    section_id: data.section_id,
                    can_view: (_a = data.can_view) !== null && _a !== void 0 ? _a : false,
                    can_create: (_b = data.can_create) !== null && _b !== void 0 ? _b : false,
                    can_edit: (_c = data.can_edit) !== null && _c !== void 0 ? _c : false,
                    can_delete: (_d = data.can_delete) !== null && _d !== void 0 ? _d : false,
                    can_export: (_e = data.can_export) !== null && _e !== void 0 ? _e : false,
                },
            });
        });
    }
    findByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.roleSectionPermission.findMany({
                where: { role },
                include: {
                    section: {
                        select: {
                            id: true, name_section: true, link: true, icon: true,
                            section_order: true, level: true, parent_id: true, is_active: true,
                        },
                    },
                },
                orderBy: { section: { section_order: 'asc' } },
            });
        });
    }
    findByRoleAndSection(role, section_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.roleSectionPermission.findUnique({
                where: { role_section_id: { role, section_id } },
                include: { section: true },
            });
        });
    }
    delete(role, section_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.roleSectionPermission.delete({
                where: { role_section_id: { role, section_id } },
            });
        });
    }
    // Bulk upsert — asignar permisos de una sección a múltiples roles a la vez
    bulkUpsert(section_id, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.$transaction(permissions.map(p => {
                var _a, _b, _c, _d, _e;
                return db_1.prisma.roleSectionPermission.upsert({
                    where: { role_section_id: { role: p.role, section_id } },
                    update: {
                        can_view: p.can_view,
                        can_create: p.can_create,
                        can_edit: p.can_edit,
                        can_delete: p.can_delete,
                        can_export: p.can_export,
                    },
                    create: {
                        role: p.role,
                        section_id,
                        can_view: (_a = p.can_view) !== null && _a !== void 0 ? _a : false,
                        can_create: (_b = p.can_create) !== null && _b !== void 0 ? _b : false,
                        can_edit: (_c = p.can_edit) !== null && _c !== void 0 ? _c : false,
                        can_delete: (_d = p.can_delete) !== null && _d !== void 0 ? _d : false,
                        can_export: (_e = p.can_export) !== null && _e !== void 0 ? _e : false,
                    },
                });
            }));
        });
    }
}
exports.RoleSectionPermissionRepository = RoleSectionPermissionRepository;
