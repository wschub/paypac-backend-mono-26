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
exports.PaymentMethodsUIService = void 0;
const paymentmethodsui_repository_1 = require("../repositories/paymentmethodsui.repository");
const paymentMethodsUIRepo = new paymentmethodsui_repository_1.PaymentMethodsUIRepository();
class PaymentMethodsUIService {
    /**
     * Crear un nuevo método de pago
     * Solo PAYPAC puede crear métodos de pago
     */
    createPaymentMethod(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validar que solo PAYPAC pueda crear métodos
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear métodos de pago');
            }
            // Validar que no exista un método con el mismo nombre
            const existingMethod = yield paymentMethodsUIRepo.findByName(data.method_name);
            if (existingMethod) {
                throw new Error(`Ya existe un método de pago con el nombre "${data.method_name}"`);
            }
            return paymentMethodsUIRepo.create(data);
        });
    }
    /**
     * Obtener todos los métodos de pago
     * Puede filtrar por status (activos/inactivos)
     */
    getPaymentMethods(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return paymentMethodsUIRepo.findAll(filters);
        });
    }
    /**
     * Obtener solo métodos de pago activos
     * Este endpoint lo usará el frontend para mostrar opciones de pago
     */
    getActivePaymentMethods() {
        return __awaiter(this, void 0, void 0, function* () {
            return paymentMethodsUIRepo.findAll({ method_status: 1 });
        });
    }
    /**
     * Obtener método de pago por ID
     */
    getPaymentMethodById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const method = yield paymentMethodsUIRepo.findById(id);
            if (!method) {
                throw new Error('Método de pago no encontrado');
            }
            return method;
        });
    }
    /**
     * Actualizar método de pago
     * Solo PAYPAC puede actualizar
     */
    updatePaymentMethod(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar métodos de pago');
            }
            const method = yield paymentMethodsUIRepo.findById(id);
            if (!method) {
                throw new Error('Método de pago no encontrado');
            }
            // Si se está cambiando el nombre, validar que no exista otro con ese nombre
            if (data.method_name && typeof data.method_name === 'string') {
                const existingMethod = yield paymentMethodsUIRepo.findByName(data.method_name);
                if (existingMethod && existingMethod.id !== id) {
                    throw new Error(`Ya existe otro método de pago con el nombre "${data.method_name}"`);
                }
            }
            return paymentMethodsUIRepo.update(id, data);
        });
    }
    /**
     * Actualizar solo el status del método de pago
     * Solo PAYPAC puede cambiar el status
     */
    updatePaymentMethodStatus(id, method_status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede cambiar el status de métodos de pago');
            }
            const method = yield paymentMethodsUIRepo.findById(id);
            if (!method) {
                throw new Error('Método de pago no encontrado');
            }
            return paymentMethodsUIRepo.update(id, { method_status });
        });
    }
    /**
     * Eliminar método de pago
     * Solo PAYPAC puede eliminar
     * TODO: Validar que no haya usuarios con este método asociado
     */
    deletePaymentMethod(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar métodos de pago');
            }
            const method = yield paymentMethodsUIRepo.findById(id);
            if (!method) {
                throw new Error('Método de pago no encontrado');
            }
            // TODO: Validar que no haya PaymentMethodsUsers asociados
            // const usersWithMethod = await prisma.paymentMethodsUsers.count({
            //   where: { method_id: id }
            // });
            // if (usersWithMethod > 0) {
            //   throw new Error('No se puede eliminar: hay usuarios usando este método');
            // }
            return paymentMethodsUIRepo.delete(id);
        });
    }
    /**
     * Obtener estadísticas de métodos de pago
     * Solo PAYPAC puede ver estadísticas
     */
    getPaymentMethodsStats(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            const allMethods = yield paymentMethodsUIRepo.findAll();
            const activeCount = yield paymentMethodsUIRepo.countActive();
            return {
                total: allMethods.length,
                active: activeCount,
                inactive: allMethods.length - activeCount,
                methods: allMethods,
            };
        });
    }
}
exports.PaymentMethodsUIService = PaymentMethodsUIService;
