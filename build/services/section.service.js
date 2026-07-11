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
exports.SectionService = void 0;
const section_repository_1 = require("../repositories/section.repository");
const sectionRepo = new section_repository_1.SectionRepository();
class SectionService {
    createSection(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede gestionar secciones');
            return sectionRepo.create(data);
        });
    }
    getAllSections(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver todas las secciones');
            return sectionRepo.findAll();
        });
    }
    getSectionById(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver esta información');
            const section = yield sectionRepo.findById(id);
            if (!section)
                throw new Error('Sección no encontrada');
            return section;
        });
    }
    // Menú dinámico para el usuario autenticado
    getMenuForRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const sections = yield sectionRepo.findMenuByRole(role);
            // Aplanar permisos al nivel del item para facilitar consumo en frontend
            return sections.map(section => (Object.assign(Object.assign({ id: section.id, name_section: section.name_section, icon: section.icon, link: section.link, order: section.section_order, level: section.level }, flattenPermissions(section.rolePermissions[0])), { children: section.children.map(child => (Object.assign({ id: child.id, name_section: child.name_section, icon: child.icon, link: child.link, order: child.section_order, level: child.level }, flattenPermissions(child.rolePermissions[0])))) })));
        });
    }
    updateSection(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede modificar secciones');
            const section = yield sectionRepo.findById(id);
            if (!section)
                throw new Error('Sección no encontrada');
            return sectionRepo.update(id, data);
        });
    }
    deleteSection(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar secciones');
            const section = yield sectionRepo.findById(id);
            if (!section)
                throw new Error('Sección no encontrada');
            return sectionRepo.delete(id); // soft delete
        });
    }
    reorderSections(items, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede reordenar secciones');
            return sectionRepo.reorder(items);
        });
    }
}
exports.SectionService = SectionService;
function flattenPermissions(perm) {
    var _a, _b, _c, _d, _e;
    return {
        can_view: (_a = perm === null || perm === void 0 ? void 0 : perm.can_view) !== null && _a !== void 0 ? _a : false,
        can_create: (_b = perm === null || perm === void 0 ? void 0 : perm.can_create) !== null && _b !== void 0 ? _b : false,
        can_edit: (_c = perm === null || perm === void 0 ? void 0 : perm.can_edit) !== null && _c !== void 0 ? _c : false,
        can_delete: (_d = perm === null || perm === void 0 ? void 0 : perm.can_delete) !== null && _d !== void 0 ? _d : false,
        can_export: (_e = perm === null || perm === void 0 ? void 0 : perm.can_export) !== null && _e !== void 0 ? _e : false,
    };
}
