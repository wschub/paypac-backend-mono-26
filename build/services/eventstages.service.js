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
exports.EventStagesService = void 0;
const eventstages_repository_1 = require("../repositories/eventstages.repository");
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const event_repository_1 = require("../repositories/event.repository");
const client_1 = require("@prisma/client");
const stagesRepo = new eventstages_repository_1.EventStagesRepository();
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
const eventRepo = new event_repository_1.EventRepository();
class EventStagesService {
    /**
     * Crear una nueva etapa para una localidad
     * Solo el dueño del evento o PAYPAC pueden crear etapas
     */
    createStage(localityId, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(localityId);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            const event = yield eventRepo.findById(locality.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para agregar etapas a esta localidad');
            }
            const blockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
                client_1.EVENT_STATUS.CANCELED,
            ];
            if (blockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden agregar etapas a un evento en estado ${event.status}`);
            }
            this.validateDates(data.date_start, data.date_end);
            if (data.price_ticket <= 0) {
                throw new Error('El precio del ticket debe ser mayor a 0');
            }
            const overlapping = yield stagesRepo.findOverlappingStages(localityId, new Date(data.date_start), new Date(data.date_end));
            if (overlapping.length > 0) {
                throw new Error(`Las fechas se solapan con otra etapa existente: "${overlapping[0].stage_name}"`);
            }
            const stageData = Object.assign(Object.assign({}, data), { locality_id: localityId });
            return stagesRepo.create(stageData);
        });
    }
    getStagesByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(localityId);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            return stagesRepo.findByLocalityId(localityId);
        });
    }
    getStageById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const stage = yield stagesRepo.findById(id);
            if (!stage) {
                throw new Error('Etapa no encontrada');
            }
            return stage;
        });
    }
    updateStage(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const stage = yield stagesRepo.findById(id);
            if (!stage) {
                throw new Error('Etapa no encontrada');
            }
            const locality = yield localitiesRepo.findById(stage.locality_id);
            if (!locality) {
                throw new Error('Localidad asociada no encontrada');
            }
            const event = yield eventRepo.findById(locality.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para actualizar esta etapa');
            }
            const lockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
            ];
            if (lockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden actualizar etapas de un evento en estado ${event.status}`);
            }
            if (data.date_start && data.date_end) {
                this.validateDates(data.date_start, data.date_end);
            }
            if (data.price_ticket && data.price_ticket <= 0) {
                throw new Error('El precio del ticket debe ser mayor a 0');
            }
            if (data.date_start || data.date_end) {
                const dateStart = data.date_start || stage.date_start;
                const dateEnd = data.date_end || stage.date_end;
                const overlapping = yield stagesRepo.findOverlappingStages(stage.locality_id, new Date(dateStart), new Date(dateEnd), id);
                if (overlapping.length > 0) {
                    throw new Error(`Las fechas se solapan con otra etapa: "${overlapping[0].stage_name}"`);
                }
            }
            return stagesRepo.update(id, data);
        });
    }
    deleteStage(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const stage = yield stagesRepo.findById(id);
            if (!stage) {
                throw new Error('Etapa no encontrada');
            }
            const locality = yield localitiesRepo.findById(stage.locality_id);
            if (!locality) {
                throw new Error('Localidad asociada no encontrada');
            }
            const event = yield eventRepo.findById(locality.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para eliminar esta etapa');
            }
            const lockedStatuses = [
                client_1.EVENT_STATUS.ACTIVE,
                client_1.EVENT_STATUS.FINALIZED,
            ];
            if (lockedStatuses.includes(event.status)) {
                throw new Error(`No se pueden eliminar etapas de un evento en estado ${event.status}`);
            }
            return stagesRepo.delete(id);
        });
    }
    getActiveStage(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(localityId);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            const activeStage = yield stagesRepo.findActiveStage(localityId);
            if (!activeStage) {
                return {
                    message: 'No hay etapa activa en este momento',
                    active_stage: null,
                };
            }
            return {
                message: 'Etapa activa encontrada',
                active_stage: activeStage,
            };
        });
    }
    getUpcomingStages(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(localityId);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            return stagesRepo.findUpcomingStages(localityId);
        });
    }
    getPriceStats(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield localitiesRepo.findById(localityId);
            if (!locality) {
                throw new Error('Localidad no encontrada');
            }
            return stagesRepo.getPriceStatsByLocalityId(localityId);
        });
    }
    validateDates(dateStart, dateEnd) {
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        if (end <= start) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        const now = new Date();
        if (start < now) {
            throw new Error('La fecha de inicio no puede ser en el pasado');
        }
    }
    checkAvailability(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stage = yield stagesRepo.findById(stageId);
            if (!stage) {
                throw new Error('Etapa no encontrada');
            }
            return {
                stage_id: stage.id,
                stage_name: stage.stage_name,
                price_ticket: stage.price_ticket,
                date_start: stage.date_start,
                date_end: stage.date_end,
                is_active: new Date() >= stage.date_start && new Date() <= stage.date_end,
            };
        });
    }
}
exports.EventStagesService = EventStagesService;
