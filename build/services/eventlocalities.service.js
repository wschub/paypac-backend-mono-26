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
exports.EventLocalitiesService = void 0;
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const event_repository_1 = require("../repositories/event.repository");
const client_1 = require("@prisma/client");
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
const eventRepo = new event_repository_1.EventRepository();
class EventLocalitiesService {
    /**
     * Crear una nueva localidad para un evento
     * Solo el dueño del evento o PAYPAC pueden crear localidades
     */
    createLocality(eventId, data, userId, userRole) {
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
                throw new Error('No tienes permisos para agregar localidades a este evento');
            }
            // No permitir agregar localidades si el evento ya está ACTIVE o FINALIZED
            const blockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
                client_1.EVENT_STATUS.CANCELED,
            ];
            if (blockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden agregar localidades a un evento en estado ${event.status}`);
            }
            // Crear la localidad
            const localityData = Object.assign(Object.assign({}, data), { event_id: eventId });
            return localitiesRepo.create(localityData);
        });
    }
    /**
     * Obtener todas las localidades de un evento
     *
     * ⚠️ Compatibilidad: las builds de la app anteriores a jul/2026 parsean
     * title_color/text_color/title_color_location como campos requeridos.
     * Esas columnas fueron eliminadas de la DB — se devuelven como constantes
     * para no romper las apps instaladas. Quitar cuando la base instalada migre.
     */
    getLocalitiesByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            const localities = yield localitiesRepo.findByEventId(eventId);
            return localities.map((loc) => (Object.assign(Object.assign({}, loc), { title_color: '#FFFFFF', text_color: '#FFFFFF', title_color_location: '#FFFFFF' })));
        });
    }
    /**
     * Obtener una localidad específica por ID
     */
    getLocalityById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findByIdWithDetails(id);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            return locality;
        });
    }
    /**
     * Actualizar una localidad
     * Solo el dueño del evento o PAYPAC pueden actualizar
     */
    updateLocality(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(id);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            // Verificar que el evento existe
            const event = yield eventRepo.findById(locality.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para actualizar esta localidad');
            }
            // No permitir actualizar si el evento ya está ACTIVE o FINALIZED
            const blockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
            ];
            if (blockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden actualizar localidades de un evento en estado ${event.status}`);
            }
            return localitiesRepo.update(id, data);
        });
    }
    /**
     * Eliminar una localidad
     * Solo el dueño del evento o PAYPAC pueden eliminar
     */
    deleteLocality(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(id);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            // Verificar que el evento existe
            const event = yield eventRepo.findById(locality.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para eliminar esta localidad');
            }
            // No permitir eliminar si el evento ya está ACTIVE o FINALIZED
            const blockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
            ];
            if (blockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden eliminar localidades de un evento en estado ${event.status}`);
            }
            // Verificar si hay stages asociadas (opcional: podrías permitir cascade delete)
            /*if (locality.stages && locality.stages.length > 0) {
              throw new Error(
                'No se puede eliminar una localidad con etapas asociadas. Elimina las etapas primero.'
              );
            } */
            return localitiesRepo.delete(id);
        });
    }
    /**
     * Obtener estadísticas de localidades de un evento
     */
    getLocalitiesStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const localities = yield localitiesRepo.findByEventId(eventId);
            const stats = {
                total_localities: localities.length,
                localities_with_stages: 0,
                total_stages: 0,
                localities: localities.map(l => ({
                    id: l.id,
                    name: l.name_locality,
                    stages_count: 0,
                })),
            };
            return stats;
        });
    }
    /**
     * Validar que los colores sean válidos (formato hexadecimal)
     */
    isValidHexColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    }
    /**
     * Validar datos de localidad antes de crear/actualizar
     */
    validateLocalityData(data) {
        const { bkg_color } = data;
        if (bkg_color && !this.isValidHexColor(bkg_color)) {
            throw new Error('El color bkg_color debe ser un código hexadecimal válido (ej: #FF5733)');
        }
        return true;
    }
}
exports.EventLocalitiesService = EventLocalitiesService;
