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
exports.deleteCode = exports.toggleActive = exports.getAllCodes = exports.validateCode = exports.getMyStats = exports.getMyCode = exports.createMyCode = void 0;
const promoter_code_service_1 = require("../services/promoter_code.service");
const utils_1 = require("../utils/utils");
const promoCodeService = new promoter_code_service_1.PromoterCodeService();
const createMyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { custom_code } = req.body;
        const result = yield promoCodeService.createCode(user.id, user.role, user.id, custom_code);
        res.status(201).json({ message: 'Código creado exitosamente', promoter_code: result });
    }
    catch (err) {
        const status = err.message.includes('permisos') ? 403
            : err.message.includes('ya tiene') || err.message.includes('en uso') ? 409 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.createMyCode = createMyCode;
const getMyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield promoCodeService.getMyCode(req.user.id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getMyCode = getMyCode;
const getMyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield promoCodeService.getMyStats(req.user.id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getMyStats = getMyStats;
const validateCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        const codeString = (0, utils_1.paramToString)(code);
        const result = yield promoCodeService.validateCode(codeString);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.validateCode = validateCode;
const getAllCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const is_active = req.query.is_active !== undefined
            ? req.query.is_active === 'true'
            : undefined;
        const result = yield promoCodeService.getAllCodes({ is_active }, req.user.role);
        res.status(200).json({ total: result.length, codes: result });
    }
    catch (err) {
        res.status(403).json({ message: err.message });
    }
});
exports.getAllCodes = getAllCodes;
const toggleActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield promoCodeService.toggleActive(Number(req.params.id), req.user.role);
        res.status(200).json({ message: `Código ${result.is_active ? 'activado' : 'desactivado'}`, code: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.toggleActive = toggleActive;
const deleteCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield promoCodeService.deleteCode(Number(req.params.id), req.user.role);
        res.status(200).json({ message: 'Código eliminado exitosamente' });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.deleteCode = deleteCode;
