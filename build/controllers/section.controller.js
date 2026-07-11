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
exports.reorderSections = exports.deleteSection = exports.updateSection = exports.getMenu = exports.getSectionById = exports.getAllSections = exports.createSection = void 0;
const section_service_1 = require("../services/section.service");
const sectionService = new section_service_1.SectionService();
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield sectionService.createSection(req.body, req.user.role);
        res.status(201).json({ message: 'Sección creada exitosamente', section: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.createSection = createSection;
const getAllSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sections = yield sectionService.getAllSections(req.user.role);
        res.status(200).json({ total: sections.length, sections });
    }
    catch (err) {
        res.status(403).json({ message: err.message });
    }
});
exports.getAllSections = getAllSections;
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield sectionService.getSectionById(Number(req.params.id), req.user.role);
        res.status(200).json(section);
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('Solo PAYPAC') ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
});
exports.getSectionById = getSectionById;
// GET /api/sections/menu — usa el rol del token
const getMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menu = yield sectionService.getMenuForRole(req.user.role);
        res.status(200).json({ menu });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getMenu = getMenu;
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield sectionService.updateSection(Number(req.params.id), req.body, req.user.role);
        res.status(200).json({ message: 'Sección actualizada exitosamente', section: result });
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.updateSection = updateSection;
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sectionService.deleteSection(Number(req.params.id), req.user.role);
        res.status(200).json({ message: 'Sección desactivada exitosamente' });
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('Solo PAYPAC') ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.deleteSection = deleteSection;
const reorderSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sectionService.reorderSections(req.body.items, req.user.role);
        res.status(200).json({ message: 'Orden actualizado exitosamente' });
    }
    catch (err) {
        res.status(403).json({ message: err.message });
    }
});
exports.reorderSections = reorderSections;
