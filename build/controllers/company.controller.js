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
exports.deleteCompany = exports.updateCompanyStatus = exports.approveCompany = exports.updateCompany = exports.getCompanyById = exports.getMyCompany = exports.getMyCompanies = exports.getCompaniesStats = exports.getCompanies = exports.createCompany = exports.getCompanyFollowers = void 0;
const company_service_1 = require("../services/company.service");
const companyService = new company_service_1.CompanyService();
/**
 * PROVISIONAL
 */
const getCompanyFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = Number(req.params.id);
        const result = yield companyService.getCompanyFollowers(companyId);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getCompanyFollowers = getCompanyFollowers;
/**
 * POST /api/companies
 * Crear empresa
 * Requiere: PAYPAC | ORGANIZER
 */
const createCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || '';
        const { company_name, company_description, company_logo, company_cover, company_phone_number, company_email, type_identification, num_identification, website, address, country_id, state_id, city_id, company_presentation, } = req.body;
        const result = yield companyService.createCompany({
            company_name, company_description, company_logo, company_cover,
            company_phone_number, company_email, type_identification,
            num_identification, website, address, country_id, state_id,
            city_id, company_presentation,
        }, userId, userRole);
        res.status(201).json({
            message: 'Empresa creada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createCompany = createCompany;
/**
 * GET /api/companies
 * Listar empresas (filtros según rol)
 * Acceso: todos los roles autenticados
 */
const getCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || '';
        const { search, country_id, state_id, city_id, status } = req.query;
        const result = yield companyService.getCompanies({
            search: search,
            country_id: country_id ? Number(country_id) : undefined,
            state_id: state_id ? Number(state_id) : undefined,
            city_id: city_id ? Number(city_id) : undefined,
            status: status !== undefined ? Number(status) : undefined,
        }, userId, userRole);
        res.status(200).json({
            message: 'Empresas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCompanies = getCompanies;
/**
 * GET /api/companies/stats
 * Estadísticas de empresas
 * Requiere: PAYPAC
 */
const getCompaniesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { country_id, status } = req.query;
        const result = yield companyService.getCompaniesStats(userRole, {
            country_id: country_id ? Number(country_id) : undefined,
            status: status !== undefined ? Number(status) : undefined,
        });
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCompaniesStats = getCompaniesStats;
/**
 * GET /api/companies/my-companies
 * Empresas del ORGANIZER autenticado
 * Requiere: ORGANIZER
 */
const getMyCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const result = yield companyService.getMyCompanies(userId);
        res.status(200).json({
            message: 'Mis empresas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getMyCompanies = getMyCompanies;
/**
 * GET MY COMPANY
 *
 */
const getMyCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.user.role;
        const companyId = req.user.company_id;
        if (!companyId) {
            res.status(400).json({ success: false, message: 'Tu cuenta no tiene una empresa asociada' });
            return;
        }
        const company = yield companyService.getMyCompany(companyId, userRole);
        res.status(200).json({ success: true, data: company });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getMyCompany = getMyCompany;
/**
 * GET /api/companies/:id
 * Empresa por ID
 * Acceso: todos los roles autenticados
 */
const getCompanyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || '';
        const { id } = req.params;
        const result = yield companyService.getCompanyById(Number(id), userId, userRole);
        res.status(200).json({
            message: 'Empresa obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCompanyById = getCompanyById;
/**
 * PUT /api/companies/:id
 * Actualizar empresa
 * Requiere: PAYPAC | ORGANIZER (solo las suyas y si no está aprobada)
 */
const updateCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || '';
        const { id } = req.params;
        const { company_name, company_description, company_logo, company_cover, company_phone_number, company_email, type_identification, num_identification, website, address, country_id, state_id, city_id, company_presentation, } = req.body;
        const result = yield companyService.updateCompany(Number(id), {
            company_name, company_description, company_logo, company_cover,
            company_phone_number, company_email, type_identification,
            num_identification, website, address, country_id, state_id,
            city_id, company_presentation,
        }, userId, userRole);
        res.status(200).json({
            message: 'Empresa actualizada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateCompany = updateCompany;
/**
 * PATCH /api/companies/:id/approve
 * Aprobar empresa
 * Requiere: PAYPAC
 */
const approveCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { id } = req.params;
        const result = yield companyService.approveCompany(Number(id), userRole);
        res.status(200).json({
            message: 'Empresa aprobada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.approveCompany = approveCompany;
/**
 * PATCH /api/companies/:id/status
 * Actualizar status de empresa
 * Requiere: PAYPAC
 */
const updateCompanyStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { id } = req.params;
        const { status } = req.body;
        const result = yield companyService.updateStatus(Number(id), status, userRole);
        res.status(200).json({
            message: 'Status actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateCompanyStatus = updateCompanyStatus;
/**
 * DELETE /api/companies/:id
 * Eliminar empresa
 * Requiere: PAYPAC
 */
const deleteCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { id } = req.params;
        const result = yield companyService.deleteCompany(Number(id), userRole);
        res.status(200).json({
            message: 'Empresa eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCompany = deleteCompany;
