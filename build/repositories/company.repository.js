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
exports.CompanyRepository = void 0;
const db_1 = require("../config/db");
class CompanyRepository {
    /**
     * Crear una nueva empresa
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.create({
                data,
                include: this.defaultInclude(),
            });
        });
    }
    /**
     * Obtener todas las empresas con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.OR = [
                    { company_name: { contains: filters.search, mode: 'insensitive' } },
                    { company_email: { contains: filters.search, mode: 'insensitive' } },
                    { company_description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters === null || filters === void 0 ? void 0 : filters.country_id)
                where.country_id = filters.country_id;
            if (filters === null || filters === void 0 ? void 0 : filters.state_id)
                where.state_id = filters.state_id;
            if (filters === null || filters === void 0 ? void 0 : filters.city_id)
                where.city_id = filters.city_id;
            if ((filters === null || filters === void 0 ? void 0 : filters.status) !== undefined)
                where.status = filters.status;
            return db_1.prisma.company.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: this.defaultInclude(),
            });
        });
    }
    /**
     * Buscar empresa por ID con relaciones completas
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.findUnique({
                where: { id },
                include: this.defaultInclude(),
            });
        });
    }
    /**
     * Buscar empresa por nombre
     */
    findByName(company_name) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.findUnique({ where: { company_name } });
        });
    }
    /**
     * Buscar empresa por email
     */
    findByEmail(company_email) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.findUnique({ where: { company_email } });
        });
    }
    /**
     * Empresas registradas por un usuario (ORGANIZER)
     */
    findByRegisteredUser(user_id_register) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.findMany({
                where: { user_id_register },
                orderBy: { createdAt: 'desc' },
                include: this.defaultInclude(),
            });
        });
    }
    /**
     * Actualizar empresa
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.update({
                where: { id },
                data,
                include: this.defaultInclude(),
            });
        });
    }
    /**
     * Actualizar solo el status
     */
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.update({
                where: { id },
                data: { status },
            });
        });
    }
    /**
     * Actualizar fecha de aprobación
     */
    approve(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.update({
                where: { id },
                data: {
                    status: 1,
                    approved_at: new Date(),
                },
            });
        });
    }
    /**
     * Eliminar empresa
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.company.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.company.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas de empresas
     */
    getStats(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.country_id)
                where.country_id = filters.country_id;
            if ((filters === null || filters === void 0 ? void 0 : filters.status) !== undefined)
                where.status = filters.status;
            const [total, approved, pending, withRating] = yield Promise.all([
                db_1.prisma.company.count({ where }),
                db_1.prisma.company.count({ where: Object.assign(Object.assign({}, where), { status: 1 }) }),
                db_1.prisma.company.count({ where: Object.assign(Object.assign({}, where), { status: 0 }) }),
                db_1.prisma.company.count({ where: Object.assign(Object.assign({}, where), { rating: { gt: 0 } }) }),
            ]);
            return {
                total,
                approved,
                pending,
                with_rating: withRating,
            };
        });
    }
    /**
     * Include reutilizable para relaciones comunes
     */
    defaultInclude() {
        return {
            country: { select: { id: true, name_country: true, code: true } },
            state: { select: { id: true, name_state: true } },
            city: { select: { id: true, name_city: true } },
            registeredBy: {
                select: { id: true, name: true, last_name: true, email: true },
            },
            _count: { select: { users: true } },
        };
    }
}
exports.CompanyRepository = CompanyRepository;
