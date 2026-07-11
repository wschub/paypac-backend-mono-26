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
exports.EventDctoService = void 0;
const eventdcto_repository_1 = require("../repositories/eventdcto.repository");
const event_repository_1 = require("../repositories/event.repository");
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const client_1 = require("@prisma/client");
const dctoRepo = new eventdcto_repository_1.EventDctoRepository();
const eventRepo = new event_repository_1.EventRepository();
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
class EventDctoService {
    /**
     * Crear un nuevo descuento
     * Solo el dueño del evento o PAYPAC pueden crear descuentos
     */
    createDiscount(eventId, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el evento existe
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para crear descuentos en este evento');
            }
            // No permitir crear descuentos si el evento ya está FINALIZED o CANCELED
            const blockedStatuses = [
                client_1.EVENT_STATUS.FINALIZED,
                client_1.EVENT_STATUS.CANCELED,
            ];
            if (blockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden crear descuentos en un evento en estado ${event.status}`);
            }
            // Validar tipo de descuento
            if (![1, 2].includes(data.type_dcto)) {
                throw new Error('Tipo de descuento inválido. Debe ser 1 (Porcentaje) o 2 (Monto fijo)');
            }
            // Validar valor del descuento
            if (data.value_dcto <= 0) {
                throw new Error('El valor del descuento debe ser mayor a 0');
            }
            // Si es porcentaje, validar que no sea mayor a 100
            if (data.type_dcto === 1 && data.value_dcto > 100) {
                throw new Error('El descuento por porcentaje no puede ser mayor a 100%');
            }
            // Si se especifica localidad, verificar que existe
            if (data.locality_id) {
                const locality = yield localitiesRepo.findById(data.locality_id);
                if (!locality || locality.event_id !== eventId) {
                    throw new Error('Localidad no encontrada o no pertenece a este evento');
                }
            }
            // Validar cantidades
            if (data.min_qty_tickets && data.max_qty_tickets) {
                if (data.min_qty_tickets > data.max_qty_tickets) {
                    throw new Error('La cantidad mínima no puede ser mayor a la cantidad máxima');
                }
            }
            // Verificar que no exista un descuento con el mismo nombre
            const existing = yield dctoRepo.findByName(eventId, data.name_dcto);
            if (existing) {
                throw new Error('Ya existe un descuento con ese nombre en este evento');
            }
            // Crear el descuento
            const discountData = Object.assign(Object.assign({}, data), { event_id: eventId, user_id: userId });
            return dctoRepo.create(discountData);
        });
    }
    /**
     * Obtener todos los descuentos de un evento
     */
    getDiscountsByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            return dctoRepo.findByEventId(eventId);
        });
    }
    /**
     * Obtener un descuento específico por ID
     */
    getDiscountById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const discount = yield dctoRepo.findById(id);
            if (!discount) {
                throw new Error('Descuento no encontrado');
            }
            return discount;
        });
    }
    /**
     * Actualizar un descuento
     * Solo el dueño del evento o PAYPAC pueden actualizar
     */
    updateDiscount(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const discount = yield dctoRepo.findById(id);
            if (!discount) {
                throw new Error('Descuento no encontrado');
            }
            const event = yield eventRepo.findById(discount.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para actualizar este descuento');
            }
            // No permitir actualizar si el evento ya está FINALIZED
            if (event.status === client_1.EVENT_STATUS.FINALIZED) {
                throw new Error(`No se pueden actualizar descuentos de un evento en estado ${event.status}`);
            }
            // Validaciones similares a la creación
            if (data.type_dcto && ![1, 2].includes(data.type_dcto)) {
                throw new Error('Tipo de descuento inválido');
            }
            if (data.value_dcto && data.value_dcto <= 0) {
                throw new Error('El valor del descuento debe ser mayor a 0');
            }
            if (data.type_dcto === 1 && data.value_dcto && data.value_dcto > 100) {
                throw new Error('El descuento por porcentaje no puede ser mayor a 100%');
            }
            return dctoRepo.update(id, data);
        });
    }
    /**
     * Eliminar un descuento
     * Solo el dueño del evento o PAYPAC pueden eliminar
     */
    deleteDiscount(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const discount = yield dctoRepo.findById(id);
            if (!discount) {
                throw new Error('Descuento no encontrado');
            }
            const event = yield eventRepo.findById(discount.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para eliminar este descuento');
            }
            // TODO: Verificar si el descuento ya fue usado en facturas
            // Si fue usado, no permitir eliminar
            return dctoRepo.delete(id);
        });
    }
    /**
     * Validar y calcular descuento
     * Endpoint público para que CUSTOMER pueda validar códigos
     */
    validateDiscount(eventId, discountName, quantity, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Buscar el descuento por nombre
            const discount = yield dctoRepo.findByName(eventId, discountName);
            if (!discount) {
                throw new Error('Código de descuento no válido');
            }
            // ✅ Agregar estas dos validaciones
            if (!discount.is_active)
                throw new Error('Este código de descuento no está activo');
            if (discount.max_uses && discount.uses_count >= discount.max_uses)
                throw new Error('Este código de descuento ha alcanzado el límite de usos');
            // Verificar si aplica a la localidad
            if (discount.locality_id && localityId && discount.locality_id !== localityId) {
                throw new Error('Este descuento no es válido para la localidad seleccionada');
            }
            // Verificar cantidad mínima
            if (discount.min_qty_tickets && quantity < discount.min_qty_tickets) {
                throw new Error(`Este descuento requiere comprar al menos ${discount.min_qty_tickets} tickets`);
            }
            // Verificar cantidad máxima
            if (discount.max_qty_tickets && quantity > discount.max_qty_tickets) {
                throw new Error(`Este descuento solo aplica hasta ${discount.max_qty_tickets} tickets`);
            }
            return {
                valid: true,
                discount: {
                    id: discount.id,
                    name: discount.name_dcto,
                    description: discount.description,
                    type: discount.type_dcto === 1 ? 'percentage' : 'fixed',
                    value: discount.value_dcto,
                },
            };
        });
    }
    /**
     * Calcular monto de descuento
     */
    calculateDiscountAmount(totalAmount, discountType, discountValue) {
        if (discountType === 1) {
            // Porcentaje
            return Math.round((totalAmount * discountValue) / 100);
        }
        else {
            // Monto fijo
            return Math.min(discountValue, totalAmount); // No puede ser mayor al total
        }
    }
    /**
     * Obtener descuentos aplicables
     */
    getApplicableDiscounts(eventId, quantity, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return dctoRepo.findApplicableDiscounts(eventId, quantity, localityId);
        });
    }
    /**
   * Activar/desactivar código de descuento
   * Solo el dueño del evento o PAYPAC
   */
    toggleDiscount(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const discount = yield dctoRepo.findById(id);
            if (!discount)
                throw new Error('Descuento no encontrado');
            const event = yield eventRepo.findById(discount.event_id);
            if (!event)
                throw new Error('Evento asociado no encontrado');
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permisos para modificar este descuento');
            return dctoRepo.update(id, { is_active: !discount.is_active });
        });
    }
}
exports.EventDctoService = EventDctoService;
