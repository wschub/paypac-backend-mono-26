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
exports.StatesService = void 0;
const states_repository_1 = require("../repositories/states.repository");
const countries_repository_1 = require("../repositories/countries.repository");
const statesRepo = new states_repository_1.StatesRepository();
const countriesRepo = new countries_repository_1.CountriesRepository();
class StatesService {
    /**
     * Crear un nuevo estado — solo PAYPAC
     */
    createState(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear estados');
            }
            // Verificar que el país existe
            const country = yield countriesRepo.findById(data.country_id);
            if (!country) {
                throw new Error(`El país con ID ${data.country_id} no existe`);
            }
            // Validar nombre único dentro del país
            const existing = yield statesRepo.findByNameAndCountry(data.name_state, data.country_id);
            if (existing) {
                throw new Error(`Ya existe el estado "${data.name_state}" en ${country.name_country}`);
            }
            return statesRepo.create({
                name_state: data.name_state,
                country: { connect: { id: data.country_id } },
            });
        });
    }
    /**
     * Listar estados — todos los roles autenticados
     */
    getStates(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return statesRepo.findAll(filters);
        });
    }
    /**
     * Estado por ID — todos los roles autenticados
     */
    getStateById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield statesRepo.findById(id);
            if (!state) {
                throw new Error('Estado no encontrado');
            }
            return state;
        });
    }
    /**
     * Estados de un país específico — todos los roles autenticados
     */
    getStatesByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el país existe
            const country = yield countriesRepo.findById(country_id);
            if (!country) {
                throw new Error(`El país con ID ${country_id} no existe`);
            }
            return statesRepo.findByCountry(country_id);
        });
    }
    /**
     * Actualizar estado — solo PAYPAC
     */
    updateState(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar estados');
            }
            const state = yield statesRepo.findById(id);
            if (!state) {
                throw new Error('Estado no encontrado');
            }
            // Si se cambia el país, verificar que exista
            const targetCountryId = (_a = data.country_id) !== null && _a !== void 0 ? _a : state.country_id;
            if (data.country_id && data.country_id !== state.country_id) {
                const country = yield countriesRepo.findById(data.country_id);
                if (!country) {
                    throw new Error(`El país con ID ${data.country_id} no existe`);
                }
            }
            // Si se cambia el nombre, validar unicidad en el país destino
            if (data.name_state) {
                const existing = yield statesRepo.findByNameAndCountry(data.name_state, targetCountryId);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe el estado "${data.name_state}" en el país con ID ${targetCountryId}`);
                }
            }
            const updateData = {};
            if (data.name_state)
                updateData.name_state = data.name_state;
            if (data.country_id)
                updateData.country = { connect: { id: data.country_id } };
            return statesRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar estado — solo PAYPAC
     * Valida que no tenga ciudades asociadas
     */
    deleteState(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar estados');
            }
            const state = yield statesRepo.findById(id);
            if (!state) {
                throw new Error('Estado no encontrado');
            }
            const counts = state._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.cities) > 0) {
                throw new Error(`No se puede eliminar: el estado tiene ${counts.cities} ciudad(es) asociada(s). Elimínalas primero.`);
            }
            return statesRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     * Acepta filtro opcional por country_id
     */
    getStatesStats(userRole, country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return statesRepo.getStats(country_id);
        });
    }
}
exports.StatesService = StatesService;
