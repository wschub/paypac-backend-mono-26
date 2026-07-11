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
exports.EventPlaceRowService = void 0;
const event_place_row_repository_1 = require("../repositories/event_place_row.repository");
const event_place_zone_repository_1 = require("../repositories/event_place_zone.repository");
const rowRepo = new event_place_row_repository_1.EventPlaceRowRepository();
const zoneRepo = new event_place_zone_repository_1.EventPlaceZoneRepository();
class EventPlaceRowService {
    /**
     * Crear fila dentro de una zona — solo PAYPAC
     */
    createRow(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear filas');
            const zone = yield zoneRepo.findById(data.zone_id);
            if (!zone)
                throw new Error(`Zona con ID ${data.zone_id} no encontrada`);
            const existing = yield rowRepo.findByNameAndZone(data.name, data.zone_id);
            if (existing)
                throw new Error(`Ya existe la fila "${data.name}" en la zona "${zone.name}"`);
            return rowRepo.create({
                name: data.name,
                zone: { connect: { id: data.zone_id } },
            });
        });
    }
    /**
     * Filas de una zona — roles internos
     */
    getRowsByZone(zone_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const zone = yield zoneRepo.findById(zone_id);
            if (!zone)
                throw new Error(`Zona con ID ${zone_id} no encontrada`);
            return rowRepo.findAll(zone_id);
        });
    }
    /**
     * Fila por ID con sillas — roles internos
     */
    getRowById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield rowRepo.findById(id);
            if (!row)
                throw new Error('Fila no encontrada');
            return row;
        });
    }
    /**
     * Actualizar fila — solo PAYPAC
     */
    updateRow(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede actualizar filas');
            const row = yield rowRepo.findById(id);
            if (!row)
                throw new Error('Fila no encontrada');
            if (data.name) {
                const existing = yield rowRepo.findByNameAndZone(data.name, row.zone_id);
                if (existing && existing.id !== id)
                    throw new Error(`Ya existe otra fila "${data.name}" en esta zona`);
            }
            return rowRepo.update(id, data);
        });
    }
    /**
     * Eliminar fila — solo PAYPAC
     * Valida que no tenga sillas asociadas
     */
    deleteRow(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar filas');
            const row = yield rowRepo.findById(id);
            if (!row)
                throw new Error('Fila no encontrada');
            const counts = row._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.seats) > 0)
                throw new Error(`No se puede eliminar: la fila tiene ${counts.seats} silla(s). Elimínalas primero.`);
            return rowRepo.delete(id);
        });
    }
}
exports.EventPlaceRowService = EventPlaceRowService;
