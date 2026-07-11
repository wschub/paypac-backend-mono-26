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
exports.deletePlace = exports.updatePlaceMap = exports.updatePlace = exports.getPlaceWithFullLayout = exports.getPlaceById = exports.getPlaces = exports.createPlace = void 0;
const event_places_service_1 = require("../services/event_places.service");
const placesService = new event_places_service_1.EventPlacesService();
/**
 * POST /api/venues
 * Crear un lugar nuevo — solo PAYPAC
 */
const createPlace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield placesService.createPlace(req.body, userRole);
        res.status(201).json({ message: 'Lugar creado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createPlace = createPlace;
/**
 * GET /api/venues
 * Listar lugares con filtros opcionales
 */
const getPlaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, type_place, place_type } = req.query;
        const result = yield placesService.getPlaces({
            search: search,
            type_place: type_place,
            place_type: place_type,
        });
        res.status(200).json({ message: 'Lugares obtenidos exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getPlaces = getPlaces;
/**
 * GET /api/venues/:id
 * Lugar por ID con zonas y conteos
 */
const getPlaceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield placesService.getPlaceById(Number(req.params.id));
        res.status(200).json({ message: 'Lugar obtenido exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getPlaceById = getPlaceById;
/**
 * GET /api/venues/:id/layout
 * Layout completo: zones → rows → seats
 */
const getPlaceWithFullLayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield placesService.getPlaceWithFullLayout(Number(req.params.id));
        res.status(200).json({ message: 'Layout completo obtenido', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getPlaceWithFullLayout = getPlaceWithFullLayout;
/**
 * PUT /api/venues/:id
 * Actualizar lugar — solo PAYPAC
 */
const updatePlace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield placesService.updatePlace(Number(req.params.id), req.body, userRole);
        res.status(200).json({ message: 'Lugar actualizado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updatePlace = updatePlace;
/**
 * PATCH /api/venues/:id/map
 * Actualizar solo el JSON del mapa interactivo — solo PAYPAC
 */
const updatePlaceMap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield placesService.updateMap(Number(req.params.id), req.body.map_place, userRole);
        res.status(200).json({ message: 'Mapa actualizado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updatePlaceMap = updatePlaceMap;
/**
 * DELETE /api/venues/:id
 * Eliminar lugar — solo PAYPAC (sin zonas ni eventos)
 */
const deletePlace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield placesService.deletePlace(Number(req.params.id), userRole);
        res.status(200).json({ message: 'Lugar eliminado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deletePlace = deletePlace;
