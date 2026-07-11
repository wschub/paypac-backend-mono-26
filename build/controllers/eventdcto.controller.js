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
exports.toggleDiscount = exports.getApplicableDiscounts = exports.calculateDiscount = exports.validateDiscount = exports.deleteDiscount = exports.updateDiscount = exports.getDiscountById = exports.getDiscountsByEventId = exports.createDiscount = void 0;
const eventdcto_service_1 = require("../services/eventdcto.service");
const dctoService = new eventdcto_service_1.EventDctoService();
/**
 * POST /api/events/:eventId/discounts
 * Crear un nuevo descuento para un evento
 */
const createDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const data = req.body;
        const discount = yield dctoService.createDiscount(eventId, data, user.id, user.role);
        res.status(201).json({
            message: 'Descuento creado exitosamente',
            discount,
        });
    }
    catch (err) {
        console.error('❌ Error en createDiscount:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createDiscount = createDiscount;
/**
 * GET /api/events/:eventId/discounts
 * Obtener todos los descuentos de un evento
 */
const getDiscountsByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = Number(req.params.eventId);
        const discounts = yield dctoService.getDiscountsByEventId(eventId);
        res.status(200).json({
            total: discounts.length,
            discounts,
        });
    }
    catch (err) {
        console.error('❌ Error en getDiscountsByEventId:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getDiscountsByEventId = getDiscountsByEventId;
/**
 * GET /api/discounts/:id
 * Obtener un descuento específico por ID
 */
const getDiscountById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const discount = yield dctoService.getDiscountById(id);
        res.status(200).json(discount);
    }
    catch (err) {
        console.error('❌ Error en getDiscountById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getDiscountById = getDiscountById;
/**
 * PUT /api/discounts/:id
 * Actualizar un descuento
 */
const updateDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        const updatedDiscount = yield dctoService.updateDiscount(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Descuento actualizado exitosamente',
            discount: updatedDiscount,
        });
    }
    catch (err) {
        console.error('❌ Error en updateDiscount:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateDiscount = updateDiscount;
/**
 * DELETE /api/discounts/:id
 * Eliminar un descuento
 */
const deleteDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield dctoService.deleteDiscount(id, user.id, user.role);
        res.status(200).json({
            message: 'Descuento eliminado exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteDiscount:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteDiscount = deleteDiscount;
/**
 * POST /api/discounts/validate
 * Validar un código de descuento
 * Endpoint público para que CUSTOMER pueda validar
 */
const validateDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id, discount_name, quantity, locality_id } = req.body;
        const result = yield dctoService.validateDiscount(event_id, discount_name, quantity, locality_id);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en validateDiscount:', err);
        res.status(400).json({
            valid: false,
            error: err.message
        });
    }
});
exports.validateDiscount = validateDiscount;
/**
 * POST /api/discounts/calculate
 * Calcular monto de descuento
 */
const calculateDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { total_amount, discount_type, discount_value } = req.body;
        const discountAmount = dctoService.calculateDiscountAmount(total_amount, discount_type, discount_value);
        res.status(200).json({
            total_amount,
            discountAmount,
            final_amount: total_amount - discountAmount,
        });
    }
    catch (err) {
        console.error('❌ Error en calculateDiscount:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.calculateDiscount = calculateDiscount;
/**
 * GET /api/events/:eventId/discounts/applicable
 * Obtener descuentos aplicables para una cantidad de tickets
 */
const getApplicableDiscounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = Number(req.params.eventId);
        const quantity = Number(req.query.quantity);
        const localityId = req.query.locality_id
            ? Number(req.query.locality_id)
            : undefined;
        if (!quantity || quantity <= 0) {
            res.status(400).json({ error: 'Cantidad de tickets inválida' });
            return;
        }
        const discounts = yield dctoService.getApplicableDiscounts(eventId, quantity, localityId);
        res.status(200).json({
            total: discounts.length,
            discounts,
        });
    }
    catch (err) {
        console.error('❌ Error en getApplicableDiscounts:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.getApplicableDiscounts = getApplicableDiscounts;
const toggleDiscount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dctoService.toggleDiscount(Number(req.params.id), req.user.id, req.user.role);
        res.status(200).json({
            message: `Descuento ${result.is_active ? 'activado' : 'desactivado'} exitosamente`,
            discount: result,
        });
    }
    catch (err) {
        const status = err.message.includes('permisos') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.toggleDiscount = toggleDiscount;
