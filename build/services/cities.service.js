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
exports.CitiesService = void 0;
const cities_repository_1 = require("../repositories/cities.repository");
const countries_repository_1 = require("../repositories/countries.repository");
const states_repository_1 = require("../repositories/states.repository");
const citiesRepo = new cities_repository_1.CitiesRepository();
const countriesRepo = new countries_repository_1.CountriesRepository();
const statesRepo = new states_repository_1.StatesRepository();
class CitiesService {
    /**
     * Crear una nueva ciudad — solo PAYPAC
     */
    createCity(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear ciudades');
            }
            // Verificar que el país existe
            const country = yield countriesRepo.findById(data.country_id);
            if (!country) {
                throw new Error(`El país con ID ${data.country_id} no existe`);
            }
            // Verificar que el estado existe
            const state = yield statesRepo.findById(data.state_id);
            if (!state) {
                throw new Error(`El estado con ID ${data.state_id} no existe`);
            }
            // Verificar que el estado pertenece al país
            if (state.country_id !== data.country_id) {
                throw new Error(`El estado "${state.name_state}" no pertenece al país indicado`);
            }
            // Validar nombre único dentro del estado
            const existing = yield citiesRepo.findByNameAndState(data.name_city, data.state_id);
            if (existing) {
                throw new Error(`Ya existe la ciudad "${data.name_city}" en el estado "${state.name_state}"`);
            }
            return citiesRepo.create({
                name_city: data.name_city,
                latitude: (_a = data.latitude) !== null && _a !== void 0 ? _a : '',
                longitude: (_b = data.longitude) !== null && _b !== void 0 ? _b : '',
                country: { connect: { id: data.country_id } },
                state: { connect: { id: data.state_id } },
            });
        });
    }
    /**
     * Listar ciudades con filtros — todos los roles autenticados
     */
    getCities(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return citiesRepo.findAll(filters);
        });
    }
    /**
     * Ciudad por ID — todos los roles autenticados
     */
    getCityById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const city = yield citiesRepo.findById(id);
            if (!city) {
                throw new Error('Ciudad no encontrada');
            }
            return city;
        });
    }
    /**
     * Ciudades por país directamente, sin pasar por estados — todos los roles
     * Útil para selectores rápidos en el cliente
     */
    getCitiesByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield countriesRepo.findById(country_id);
            if (!country) {
                throw new Error(`El país con ID ${country_id} no existe`);
            }
            return citiesRepo.findByCountry(country_id);
        });
    }
    /**
     * Ciudades por estado — todos los roles autenticados
     */
    getCitiesByState(state_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield statesRepo.findById(state_id);
            if (!state) {
                throw new Error(`El estado con ID ${state_id} no existe`);
            }
            return citiesRepo.findByState(state_id);
        });
    }
    /**
     * Actualizar ciudad — solo PAYPAC
     */
    updateCity(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar ciudades');
            }
            const city = yield citiesRepo.findById(id);
            if (!city) {
                throw new Error('Ciudad no encontrada');
            }
            const targetStateId = (_a = data.state_id) !== null && _a !== void 0 ? _a : city.state_id;
            const targetCountryId = (_b = data.country_id) !== null && _b !== void 0 ? _b : city.country_id;
            // Verificar país si se está cambiando
            if (data.country_id && data.country_id !== city.country_id) {
                const country = yield countriesRepo.findById(data.country_id);
                if (!country) {
                    throw new Error(`El país con ID ${data.country_id} no existe`);
                }
            }
            // Verificar estado si se está cambiando
            if (data.state_id && data.state_id !== city.state_id) {
                const state = yield statesRepo.findById(data.state_id);
                if (!state) {
                    throw new Error(`El estado con ID ${data.state_id} no existe`);
                }
                // Verificar que el estado pertenece al país destino
                if (state.country_id !== targetCountryId) {
                    throw new Error(`El estado "${state.name_state}" no pertenece al país indicado`);
                }
            }
            // Validar nombre único en el estado destino (excluyendo la ciudad actual)
            if (data.name_city) {
                const existing = yield citiesRepo.findByNameAndState(data.name_city, targetStateId);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe la ciudad "${data.name_city}" en el estado con ID ${targetStateId}`);
                }
            }
            const updateData = {};
            if (data.name_city)
                updateData.name_city = data.name_city;
            if (data.latitude !== undefined)
                updateData.latitude = data.latitude;
            if (data.longitude !== undefined)
                updateData.longitude = data.longitude;
            if (data.state_id)
                updateData.state = { connect: { id: data.state_id } };
            if (data.country_id)
                updateData.country = { connect: { id: data.country_id } };
            return citiesRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar ciudad — solo PAYPAC
     */
    deleteCity(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar ciudades');
            }
            const city = yield citiesRepo.findById(id);
            if (!city) {
                throw new Error('Ciudad no encontrada');
            }
            return citiesRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     * Acepta filtros opcionales por country_id o state_id
     */
    getCitiesStats(userRole, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return citiesRepo.getStats(filters);
        });
    }
}
exports.CitiesService = CitiesService;
