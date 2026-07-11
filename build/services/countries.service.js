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
exports.CountriesService = void 0;
const countries_repository_1 = require("../repositories/countries.repository");
const countriesRepo = new countries_repository_1.CountriesRepository();
class CountriesService {
    /**
     * Crear un nuevo país — solo PAYPAC
     */
    createCountry(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear países');
            }
            const existingByCode = yield countriesRepo.findByCode(data.code);
            if (existingByCode) {
                throw new Error(`Ya existe un país con el código ISO "${data.code}"`);
            }
            const existingByName = yield countriesRepo.findByName(data.name_country);
            if (existingByName) {
                throw new Error(`Ya existe un país con el nombre "${data.name_country}"`);
            }
            return countriesRepo.create(data);
        });
    }
    /**
     * Listar países — todos los roles autenticados
     */
    getCountries(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return countriesRepo.findAll(filters);
        });
    }
    /**
     * Países con jerarquía completa estados → ciudades — todos los roles
     */
    getCountriesWithRelations() {
        return __awaiter(this, void 0, void 0, function* () {
            return countriesRepo.findAllWithRelations();
        });
    }
    /**
     * País por ID — todos los roles autenticados
     */
    getCountryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield countriesRepo.findById(id);
            if (!country) {
                throw new Error('País no encontrado');
            }
            return country;
        });
    }
    /**
     * País por código ISO
     */
    getCountryByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield countriesRepo.findByCode(code);
            if (!country) {
                throw new Error(`País con código "${code}" no encontrado`);
            }
            return country;
        });
    }
    /**
     * Actualizar país — solo PAYPAC
     */
    updateCountry(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar países');
            }
            const country = yield countriesRepo.findById(id);
            if (!country) {
                throw new Error('País no encontrado');
            }
            // Validar código ISO único (excluyendo el país actual)
            if (data.code && typeof data.code === 'string') {
                const existing = yield countriesRepo.findByCode(data.code);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe otro país con el código ISO "${data.code}"`);
                }
            }
            // Validar nombre único (excluyendo el país actual)
            if (data.name_country && typeof data.name_country === 'string') {
                const existing = yield countriesRepo.findByName(data.name_country);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe otro país con el nombre "${data.name_country}"`);
                }
            }
            return countriesRepo.update(id, data);
        });
    }
    /**
     * Eliminar país — solo PAYPAC
     * Valida que no tenga estados, ciudades o categorías asociadas
     */
    deleteCountry(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar países');
            }
            const country = yield countriesRepo.findById(id);
            if (!country) {
                throw new Error('País no encontrado');
            }
            // Usa _count que ya viene incluido en findById
            const counts = country._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.states) > 0) {
                throw new Error(`No se puede eliminar: el país tiene ${counts.states} estado(s) asociado(s). Elimínalos primero.`);
            }
            if ((counts === null || counts === void 0 ? void 0 : counts.cities) > 0) {
                throw new Error(`No se puede eliminar: el país tiene ${counts.cities} ciudad(es) asociada(s).`);
            }
            if ((counts === null || counts === void 0 ? void 0 : counts.categories) > 0) {
                throw new Error(`No se puede eliminar: el país tiene ${counts.categories} categoría(s) asociada(s).`);
            }
            return countriesRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     * Usa agregaciones en DB, no carga registros en memoria
     */
    getCountriesStats(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return countriesRepo.getStats();
        });
    }
}
exports.CountriesService = CountriesService;
