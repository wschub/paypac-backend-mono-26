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
exports.deletePaymentMethod = exports.updatePaymentMethodStatus = exports.updatePaymentMethod = exports.getPaymentMethodById = exports.getPaymentMethodsStats = exports.getActivePaymentMethods = exports.getPaymentMethods = exports.createPaymentMethod = void 0;
const paymentmethodsui_service_1 = require("../services/paymentmethodsui.service");
const paymentMethodsUIService = new paymentmethodsui_service_1.PaymentMethodsUIService();
/**
 * POST /api/payment-methods
 * Crear un nuevo método de pago
 * Requiere: PAYPAC
 */
const createPaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { method_name, mehtod_img, method_status } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield paymentMethodsUIService.createPaymentMethod({ method_name, mehtod_img, method_status }, userRole);
        res.status(201).json({
            message: 'Método de pago creado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createPaymentMethod = createPaymentMethod;
/**
 * GET /api/payment-methods
 * Listar todos los métodos de pago
 * Acceso: Todos los roles autenticados
 * Query params opcionales:
 * - method_status: 0 (inactivos) | 1 (activos)
 */
const getPaymentMethods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { method_status } = req.query;
        const filters = method_status !== undefined
            ? { method_status: Number(method_status) }
            : undefined;
        const result = yield paymentMethodsUIService.getPaymentMethods(filters);
        res.status(200).json({
            message: 'Métodos de pago obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getPaymentMethods = getPaymentMethods;
/**
 * GET /api/payment-methods/active
 * Listar solo métodos de pago activos
 * Acceso: Todos los roles autenticados
 * Este endpoint lo usa el frontend en el proceso de compra
 */
const getActivePaymentMethods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield paymentMethodsUIService.getActivePaymentMethods();
        res.status(200).json({
            message: 'Métodos de pago activos obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getActivePaymentMethods = getActivePaymentMethods;
/**
 * GET /api/payment-methods/stats
 * Obtener estadísticas de métodos de pago
 * Requiere: PAYPAC
 */
const getPaymentMethodsStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield paymentMethodsUIService.getPaymentMethodsStats(userRole);
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getPaymentMethodsStats = getPaymentMethodsStats;
/**
 * GET /api/payment-methods/:id
 * Obtener un método de pago específico por ID
 * Acceso: Todos los roles autenticados
 */
const getPaymentMethodById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield paymentMethodsUIService.getPaymentMethodById(Number(id));
        res.status(200).json({
            message: 'Método de pago obtenido exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getPaymentMethodById = getPaymentMethodById;
/**
 * PUT /api/payment-methods/:id
 * Actualizar un método de pago completo
 * Requiere: PAYPAC
 */
const updatePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { method_name, mehtod_img, method_status } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield paymentMethodsUIService.updatePaymentMethod(Number(id), { method_name, mehtod_img, method_status }, userRole);
        res.status(200).json({
            message: 'Método de pago actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updatePaymentMethod = updatePaymentMethod;
/**
 * PATCH /api/payment-methods/:id/status
 * Actualizar solo el status del método de pago
 * Requiere: PAYPAC
 */
const updatePaymentMethodStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { method_status } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield paymentMethodsUIService.updatePaymentMethodStatus(Number(id), method_status, userRole);
        res.status(200).json({
            message: 'Status actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updatePaymentMethodStatus = updatePaymentMethodStatus;
/**
 * DELETE /api/payment-methods/:id
 * Eliminar un método de pago
 * Requiere: PAYPAC
 */
const deletePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield paymentMethodsUIService.deletePaymentMethod(Number(id), userRole);
        res.status(200).json({
            message: 'Método de pago eliminado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deletePaymentMethod = deletePaymentMethod;
