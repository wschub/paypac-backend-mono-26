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
exports.PaymentMethodsUIRepository = void 0;
const db_1 = require("../config/db");
class PaymentMethodsUIRepository {
    /**
     * Crear un nuevo método de pago
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.create({
                data,
            });
        });
    }
    /**
     * Obtener todos los métodos de pago
     * Opcionalmente filtrar por status
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if ((filters === null || filters === void 0 ? void 0 : filters.method_status) !== undefined) {
                where.method_status = filters.method_status;
            }
            return db_1.prisma.paymentMethodsUI.findMany({
                where,
                // id ASC: respeta el orden del seed (CARD primero, id 1)
                orderBy: { id: 'asc' },
            });
        });
    }
    /**
     * Buscar método de pago por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar método de pago por nombre
     */
    findByName(method_name) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.findFirst({
                where: {
                    method_name: {
                        equals: method_name,
                        mode: 'insensitive', // Case-insensitive
                    }
                },
            });
        });
    }
    /**
     * Actualizar método de pago
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Eliminar método de pago
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.delete({
                where: { id },
            });
        });
    }
    /**
     * Verificar si un método de pago existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.paymentMethodsUI.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar métodos de pago activos
     */
    countActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodsUI.count({
                where: { method_status: 1 },
            });
        });
    }
}
exports.PaymentMethodsUIRepository = PaymentMethodsUIRepository;
