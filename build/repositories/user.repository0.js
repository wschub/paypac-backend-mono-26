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
exports.UserRepository = void 0;
const db_1 = require("../config/db");
class UserRepository {
    /**
     * Crear un nuevo usuario
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.create({ data });
        });
    }
    /**
     * Buscar usuario por email
     */
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findUnique({ where: { email } });
        });
    }
    /**
     * Buscar usuario por firebase_uid
     */
    findByFirebaseUid(firebaseUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findFirst({ where: { firebase_uid: firebaseUid } });
        });
    }
    /**
     * Buscar usuario por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findUnique({ where: { id } });
        });
    }
    /**
       * Buscar usuario por ID y retorna com company
       */
    findByIdWithCompany(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findUnique({
                where: { id },
                include: { company: true },
            });
        });
    }
    /**
     * Obtener todos los usuarios
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        });
    }
    /**
     * Obtener usuarios por rol
     */
    findByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findMany({
                where: { role },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Obtener usuarios por company_id
     */
    findByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findMany({
                where: { company_id: companyId },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Actualizar usuario
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.update({ where: { id }, data });
        });
    }
    /**
     * Eliminar usuario
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.delete({ where: { id } });
        });
    }
    /**
     * Verificar si un usuario existe por email
     */
    existsByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.user.count({ where: { email } });
            return count > 0;
        });
    }
    /**
     * Verificar si un usuario existe por ID
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.user.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Contar usuarios por rol
     */
    countByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.count({ where: { role } });
        });
    }
    /**
     * Obtener usuario con relaciones completas
     * ✅ Solo incluye relaciones que existen en el schema de User
     */
    findByIdWithRelations(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findUnique({
                where: { id },
                include: {
                    paymentMethods: true, // PaymentMethodCard[]
                    company: true, // Company (many-to-one)
                    favorites: true, // EventFavorites[]
                    promoterBalances: true, // EventBalancePromoters[]
                    staffAssignments: {
                        include: {
                            event: {
                                select: { id: true, name: true, date_event: true, status: true },
                            },
                        },
                    },
                },
            });
        });
    }
    /**
     * Buscar si existe un usuario para asignarlo como STAFF
     */
    search(q, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { email: { contains: q, mode: 'insensitive' } },
                                { phone_number: { contains: q, mode: 'insensitive' } },
                            ],
                        },
                        ...(roles && roles.length > 0 ? [{ role: { in: roles } }] : []),
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    last_name: true,
                    email: true,
                    phone_number: true,
                    role: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
}
exports.UserRepository = UserRepository;
