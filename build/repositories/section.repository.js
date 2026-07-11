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
exports.SectionRepository = void 0;
const db_1 = require("../config/db");
class SectionRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.create({ data });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.findMany({
                where: { is_active: true },
                orderBy: { section_order: 'asc' },
                include: {
                    children: {
                        where: { is_active: true },
                        orderBy: { section_order: 'asc' },
                    },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.findUnique({
                where: { id },
                include: {
                    children: {
                        where: { is_active: true },
                        orderBy: { section_order: 'asc' },
                    },
                    parent: true,
                },
            });
        });
    }
    // Retorna secciones con permisos para un rol específico — usado en el menú
    findMenuByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.findMany({
                where: {
                    is_active: true,
                    parent_id: null, // solo raíces — children se anidan
                    rolePermissions: {
                        some: {
                            role: role,
                            can_view: true,
                        },
                    },
                },
                orderBy: { section_order: 'asc' },
                include: {
                    rolePermissions: {
                        where: { role: role },
                    },
                    children: {
                        where: {
                            is_active: true,
                            rolePermissions: {
                                some: { role: role, can_view: true },
                            },
                        },
                        orderBy: { section_order: 'asc' },
                        include: {
                            rolePermissions: {
                                where: { role: role },
                            },
                        },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.update({
                where: { id },
                data: { is_active: false },
            });
        });
    }
    hardDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.section.delete({ where: { id } });
        });
    }
    reorder(items) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.$transaction(items.map(item => db_1.prisma.section.update({
                where: { id: item.id },
                data: { section_order: item.order },
            })));
        });
    }
}
exports.SectionRepository = SectionRepository;
