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
exports.CompanyService = void 0;
const company_repository_1 = require("../repositories/company.repository");
const countries_repository_1 = require("../repositories/countries.repository");
const states_repository_1 = require("../repositories/states.repository");
const cities_repository_1 = require("../repositories/cities.repository");
const companyRepo = new company_repository_1.CompanyRepository();
const countriesRepo = new countries_repository_1.CountriesRepository();
const statesRepo = new states_repository_1.StatesRepository();
const citiesRepo = new cities_repository_1.CitiesRepository();
class CompanyService {
    /**
   * PROVISIONAL
   */
    getCompanyFollowers(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield companyRepo.findById(companyId);
            if (!company)
                throw new Error('Empresa no encontrada');
            // TODO: reemplazar con queries reales cuando exista la entidad CompanyFollower
            return {
                total_followers: 1234,
                growth_percentage: 15.5,
                new_this_month: 48,
                last_follower_date: '2025-03-01',
                trending: 'up',
            };
        });
    }
    /**
     * Crear empresa
     * - PAYPAC: puede crear cualquier empresa
     * - ORGANIZER: crea su propia empresa (se asigna como registeredBy)
     */
    createCompany(data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
                throw new Error('No tienes permisos para crear empresas');
            }
            // Validar nombre único
            if (yield companyRepo.findByName(data.company_name)) {
                throw new Error(`Ya existe una empresa con el nombre "${data.company_name}"`);
            }
            // Validar email único si se provee
            if (data.company_email && (yield companyRepo.findByEmail(data.company_email))) {
                throw new Error(`Ya existe una empresa con el email "${data.company_email}"`);
            }
            // Validar ubicación si se provee
            yield this.validateLocation(data.country_id, data.state_id, data.city_id);
            return companyRepo.create(Object.assign(Object.assign({}, data), { company_presentation: (_a = data.company_presentation) !== null && _a !== void 0 ? _a : '', user_id_register: userId, 
                // PAYPAC aprueba automáticamente, ORGANIZER queda pendiente
                status: userRole === 'PAYPAC' ? 1 : 0, approved_at: userRole === 'PAYPAC' ? new Date() : null }));
        });
    }
    /**
     * Listar empresas
     * - PAYPAC: ve todas con cualquier filtro
     * - ORGANIZER: solo ve las suyas
     * - Resto: solo empresas aprobadas (status: 1)
     */
    getCompanies(filters, userId, userRole, userCompanyId) {
        return __awaiter(this, void 0, void 0, function* () {
            // ORGANIZER solo puede listar la empresa a la que pertenece
            if (userRole === 'ORGANIZER') {
                if (!userCompanyId)
                    return [];
                const company = yield companyRepo.findById(userCompanyId);
                return company ? [company] : [];
            }
            if (!['PAYPAC', 'STAFF'].includes(userRole)) {
                return companyRepo.findAll(Object.assign(Object.assign({}, filters), { status: 1 }));
            }
            return companyRepo.findAll(filters);
        });
    }
    /**
     * Empresa por ID
     */
    getCompanyById(id, userId, userRole, userCompanyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield companyRepo.findById(id);
            if (!company) {
                throw new Error('Empresa no encontrada');
            }
            // Seguridad: ORGANIZER solo puede ver la empresa a la que pertenece el token
            if (userRole === 'ORGANIZER' && userCompanyId !== id) {
                throw new Error('No tienes acceso a esta empresa');
            }
            // Otros roles no PAYPAC/STAFF solo ven empresas aprobadas
            if (!['PAYPAC', 'STAFF', 'ORGANIZER'].includes(userRole) && company.status !== 1) {
                throw new Error('Empresa no encontrada');
            }
            return company;
        });
    }
    /**
     * Mis empresas (para ORGANIZER)
     */
    getMyCompanies(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return companyRepo.findByRegisteredUser(userId);
        });
    }
    /**
     * Actualizar empresa
     * - PAYPAC: puede editar cualquier empresa
     * - ORGANIZER: solo puede editar las suyas y solo si no está aprobada
     */
    updateCompany(id, data, userId, userRole, userCompanyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
                throw new Error('No tienes permisos para actualizar empresas');
            }
            const company = yield companyRepo.findById(id);
            if (!company)
                throw new Error('Empresa no encontrada');
            if (userRole === 'ORGANIZER') {
                if (userCompanyId !== id) {
                    throw new Error('No tienes permisos para editar una empresa a la que no perteneces');
                }
                if (company.status === 1) {
                    throw new Error('No puedes editar una empresa ya aprobada. Contacta a PAYPAC');
                }
            }
            // Validar nombre único excluyendo la empresa actual
            if (data.company_name && data.company_name !== company.company_name) {
                const existing = yield companyRepo.findByName(data.company_name);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe una empresa con el nombre "${data.company_name}"`);
                }
            }
            // Validar email único excluyendo la empresa actual
            if (data.company_email && data.company_email !== company.company_email) {
                const existing = yield companyRepo.findByEmail(data.company_email);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe una empresa con el email "${data.company_email}"`);
                }
            }
            // Validar ubicación
            yield this.validateLocation(data.country_id, data.state_id, data.city_id);
            return companyRepo.update(id, data);
        });
    }
    /**
     * Aprobar empresa — solo PAYPAC
     */
    approveCompany(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede aprobar empresas');
            }
            const company = yield companyRepo.findById(id);
            if (!company)
                throw new Error('Empresa no encontrada');
            if (company.status === 1) {
                throw new Error('La empresa ya está aprobada');
            }
            return companyRepo.approve(id);
        });
    }
    /**
     * Actualizar status — solo PAYPAC
     */
    updateStatus(id, status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede cambiar el status de una empresa');
            }
            const company = yield companyRepo.findById(id);
            if (!company)
                throw new Error('Empresa no encontrada');
            return companyRepo.updateStatus(id, status);
        });
    }
    /**
     * Eliminar empresa — solo PAYPAC
     */
    deleteCompany(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar empresas');
            }
            const company = yield companyRepo.findById(id);
            if (!company)
                throw new Error('Empresa no encontrada');
            const userCount = (_b = (_a = company._count) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : 0;
            if (userCount > 0) {
                throw new Error(`No se puede eliminar: la empresa tiene ${userCount} usuario(s) asociado(s).`);
            }
            return companyRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     */
    getCompaniesStats(userRole, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return companyRepo.getStats(filters);
        });
    }
    /*
     PROFILE-COMPANY
    */
    getMyCompany(companyId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['ORGANIZER', 'PAYPAC'].includes(userRole)) {
                throw new Error('No tienes permisos para acceder a esta información');
            }
            if (!companyId)
                throw new Error('Tu cuenta no tiene una empresa asociada en el token');
            const company = yield companyRepo.findById(companyId);
            if (!company)
                throw new Error('Empresa no encontrada');
            return company;
        });
    }
    // ─── Helpers ────────────────────────────────────────────────────────────────
    /**
     * Validar coherencia de ubicación
     */
    validateLocation(country_id, state_id, city_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (country_id) {
                const country = yield countriesRepo.findById(country_id);
                if (!country)
                    throw new Error(`El país con ID ${country_id} no existe`);
            }
            if (state_id) {
                const state = yield statesRepo.findById(state_id);
                if (!state)
                    throw new Error(`El estado con ID ${state_id} no existe`);
                if (country_id && state.country_id !== country_id) {
                    throw new Error('El estado no pertenece al país indicado');
                }
            }
            if (city_id) {
                const city = yield citiesRepo.findById(city_id);
                if (!city)
                    throw new Error(`La ciudad con ID ${city_id} no existe`);
                if (state_id && city.state_id !== state_id) {
                    throw new Error('La ciudad no pertenece al estado indicado');
                }
            }
        });
    }
}
exports.CompanyService = CompanyService;
