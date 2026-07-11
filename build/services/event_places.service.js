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
exports.EventPlacesService = void 0;
const event_places_repository_1 = require("../repositories/event_places.repository");
const placesRepo = new event_places_repository_1.EventPlacesRepository();
class EventPlacesService {
    /**
     * Crear un lugar — solo PAYPAC
     */
    createPlace(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear lugares');
            const existing = yield placesRepo.findByName(data.name_place);
            if (existing)
                throw new Error(`Ya existe un lugar con el nombre "${data.name_place}"`);
            return placesRepo.create(data);
        });
    }
    /**
     * Listar lugares — roles internos
     */
    getPlaces(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return placesRepo.findAll(filters);
        });
    }
    /**
     * Lugar por ID con zonas — roles internos
     */
    getPlaceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const place = yield placesRepo.findById(id);
            if (!place)
                throw new Error('Lugar no encontrado');
            return place;
        });
    }
    /**
     * Layout completo zones → rows → seats — PAYPAC y ORGANIZER
     */
    getPlaceWithFullLayout(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const place = yield placesRepo.findByIdWithFullLayout(id);
            if (!place)
                throw new Error('Lugar no encontrado');
            return place;
        });
    }
    /**
     * Actualizar lugar — solo PAYPAC
     */
    updatePlace(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede actualizar lugares');
            const place = yield placesRepo.findById(id);
            if (!place)
                throw new Error('Lugar no encontrado');
            if (data.name_place && typeof data.name_place === 'string') {
                const existing = yield placesRepo.findByName(data.name_place);
                if (existing && existing.id !== id)
                    throw new Error(`Ya existe otro lugar con el nombre "${data.name_place}"`);
            }
            return placesRepo.update(id, data);
        });
    }
    /**
     * Actualizar solo el JSON del mapa — solo PAYPAC
     */
    updateMap(id, map_place, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede actualizar el mapa');
            const place = yield placesRepo.findById(id);
            if (!place)
                throw new Error('Lugar no encontrado');
            return placesRepo.update(id, { map_place });
        });
    }
    /**
     * Eliminar lugar — solo PAYPAC
     * Valida que no tenga zonas ni eventos asociados
     */
    deletePlace(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar lugares');
            const place = yield placesRepo.findById(id);
            if (!place)
                throw new Error('Lugar no encontrado');
            const counts = place._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.events) > 0)
                throw new Error(`No se puede eliminar: el lugar está asociado a ${counts.events} evento(s)`);
            if ((counts === null || counts === void 0 ? void 0 : counts.zones) > 0)
                throw new Error(`No se puede eliminar: el lugar tiene ${counts.zones} zona(s). Elimínalas primero.`);
            return placesRepo.delete(id);
        });
    }
}
exports.EventPlacesService = EventPlacesService;
