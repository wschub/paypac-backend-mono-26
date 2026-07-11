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
exports.EventPlaceZoneService = void 0;
const event_place_zone_repository_1 = require("../repositories/event_place_zone.repository");
const event_places_repository_1 = require("../repositories/event_places.repository");
const zoneRepo = new event_place_zone_repository_1.EventPlaceZoneRepository();
const placesRepo = new event_places_repository_1.EventPlacesRepository();
class EventPlaceZoneService {
    /**
     * Crear zona dentro de un lugar — solo PAYPAC
     */
    createZone(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear zonas');
            const place = yield placesRepo.findById(data.place_id);
            if (!place)
                throw new Error(`Lugar con ID ${data.place_id} no encontrado`);
            const existing = yield zoneRepo.findByNameAndPlace(data.name, data.place_id);
            if (existing)
                throw new Error(`Ya existe la zona "${data.name}" en el lugar "${place.name_place}"`);
            return zoneRepo.create({
                name: data.name,
                capacity: data.capacity,
                place: { connect: { id: data.place_id } },
            });
        });
    }
    /**
     * Zonas de un lugar — roles internos
     */
    getZonesByPlace(place_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const place = yield placesRepo.findById(place_id);
            if (!place)
                throw new Error(`Lugar con ID ${place_id} no encontrado`);
            return zoneRepo.findAll(place_id);
        });
    }
    /**
     * Zona por ID — roles internos
     */
    getZoneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const zone = yield zoneRepo.findById(id);
            if (!zone)
                throw new Error('Zona no encontrada');
            return zone;
        });
    }
    /**
     * Actualizar zona — solo PAYPAC
     */
    updateZone(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede actualizar zonas');
            const zone = yield zoneRepo.findById(id);
            if (!zone)
                throw new Error('Zona no encontrada');
            if (data.name) {
                const existing = yield zoneRepo.findByNameAndPlace(data.name, zone.place_id);
                if (existing && existing.id !== id)
                    throw new Error(`Ya existe otra zona con el nombre "${data.name}" en este lugar`);
            }
            return zoneRepo.update(id, data);
        });
    }
    /**
     * Eliminar zona — solo PAYPAC
     * Valida que no tenga filas asociadas
     */
    deleteZone(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar zonas');
            const zone = yield zoneRepo.findById(id);
            if (!zone)
                throw new Error('Zona no encontrada');
            const counts = zone._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.rows) > 0)
                throw new Error(`No se puede eliminar: la zona tiene ${counts.rows} fila(s). Elimínalas primero.`);
            return zoneRepo.delete(id);
        });
    }
}
exports.EventPlaceZoneService = EventPlaceZoneService;
