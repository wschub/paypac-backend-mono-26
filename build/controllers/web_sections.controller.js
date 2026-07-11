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
exports.getPublicSectionByUrl = exports.getPublicNav = exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getSections = exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getGroupById = exports.getGroups = exports.deleteType = exports.updateType = exports.createType = exports.getTypes = void 0;
const web_sections_service_1 = require("../services/web_sections.service");
const svc = new web_sections_service_1.WebSectionsService();
// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok = (res, data, status = 200) => res.status(status).json(data);
const err = (res, msg, status = 400) => res.status(status).json({ message: msg });
function handleError(res, e, context) {
    console.error(`[WebSections] ${context}:`, e.message);
    if (e.code === 'P2025')
        return err(res, 'Registro no encontrado', 404);
    if (e.code === 'P2002')
        return err(res, 'Ya existe un registro con ese valor único', 409);
    return err(res, e.message || 'Error interno', 500);
}
// ─── Types ────────────────────────────────────────────────────────────────────
const getTypes = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ok(res, yield svc.getTypes());
    }
    catch (e) {
        handleError(res, e, 'getTypes');
    }
});
exports.getTypes = getTypes;
const createType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type_name } = req.body;
    if (!type_name) {
        err(res, 'type_name es requerido');
        return;
    }
    try {
        ok(res, yield svc.createType(type_name), 201);
    }
    catch (e) {
        handleError(res, e, 'createType');
    }
});
exports.createType = createType;
const updateType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type_name } = req.body;
    if (!type_name) {
        err(res, 'type_name es requerido');
        return;
    }
    try {
        ok(res, yield svc.updateType(+req.params.id, type_name));
    }
    catch (e) {
        handleError(res, e, 'updateType');
    }
});
exports.updateType = updateType;
const deleteType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield svc.deleteType(+req.params.id);
        ok(res, { message: 'Tipo eliminado' });
    }
    catch (e) {
        handleError(res, e, 'deleteType');
    }
});
exports.deleteType = deleteType;
// ─── Groups ───────────────────────────────────────────────────────────────────
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ok(res, yield svc.getGroups(req.query.lang));
    }
    catch (e) {
        handleError(res, e, 'getGroups');
    }
});
exports.getGroups = getGroups;
const getGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const group = yield svc.getGroupById(+req.params.id);
        if (!group) {
            err(res, 'Grupo no encontrado', 404);
            return;
        }
        ok(res, group);
    }
    catch (e) {
        handleError(res, e, 'getGroupById');
    }
});
exports.getGroupById = getGroupById;
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { group_name, group_order, group_lang } = req.body;
    if (!group_name) {
        err(res, 'group_name es requerido');
        return;
    }
    try {
        ok(res, yield svc.createGroup({ group_name, group_order, group_lang }), 201);
    }
    catch (e) {
        handleError(res, e, 'createGroup');
    }
});
exports.createGroup = createGroup;
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { group_name, group_order, group_lang } = req.body;
    try {
        ok(res, yield svc.updateGroup(+req.params.id, { group_name, group_order, group_lang }));
    }
    catch (e) {
        handleError(res, e, 'updateGroup');
    }
});
exports.updateGroup = updateGroup;
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield svc.deleteGroup(+req.params.id);
        ok(res, { message: 'Grupo eliminado' });
    }
    catch (e) {
        handleError(res, e, 'deleteGroup');
    }
});
exports.deleteGroup = deleteGroup;
// ─── Sections ─────────────────────────────────────────────────────────────────
const getSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ok(res, yield svc.getSections(req.query.lang));
    }
    catch (e) {
        handleError(res, e, 'getSections');
    }
});
exports.getSections = getSections;
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield svc.getSectionById(+req.params.id);
        if (!section) {
            err(res, 'Sección no encontrada', 404);
            return;
        }
        ok(res, section);
    }
    catch (e) {
        handleError(res, e, 'getSectionById');
    }
});
exports.getSectionById = getSectionById;
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lang, group_id, section_order, type_id, menu_label, title, content, menu_url } = req.body;
    if (!group_id || !type_id || !menu_label) {
        err(res, 'group_id, type_id y menu_label son requeridos');
        return;
    }
    try {
        ok(res, yield svc.createSection({ lang, group_id: +group_id, section_order, type_id: +type_id, menu_label, title, content, menu_url }), 201);
    }
    catch (e) {
        handleError(res, e, 'createSection');
    }
});
exports.createSection = createSection;
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lang, group_id, section_order, type_id, menu_label, title, content, menu_url } = req.body;
    try {
        ok(res, yield svc.updateSection(+req.params.id, Object.assign(Object.assign(Object.assign(Object.assign({ lang }, (group_id !== undefined && { group_id: +group_id })), { section_order }), (type_id !== undefined && { type_id: +type_id })), { menu_label, title, content, menu_url })));
    }
    catch (e) {
        handleError(res, e, 'updateSection');
    }
});
exports.updateSection = updateSection;
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield svc.deleteSection(+req.params.id);
        ok(res, { message: 'Sección eliminada' });
    }
    catch (e) {
        handleError(res, e, 'deleteSection');
    }
});
exports.deleteSection = deleteSection;
// ─── Public ───────────────────────────────────────────────────────────────────
const getPublicNav = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ok(res, yield svc.getPublicNav(req.query.lang || 'ES'));
    }
    catch (e) {
        handleError(res, e, 'getPublicNav');
    }
});
exports.getPublicNav = getPublicNav;
const getPublicSectionByUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield svc.getSectionByUrl(decodeURIComponent(req.params.url));
        if (!section) {
            err(res, 'Página no encontrada', 404);
            return;
        }
        ok(res, section);
    }
    catch (e) {
        handleError(res, e, 'getPublicSectionByUrl');
    }
});
exports.getPublicSectionByUrl = getPublicSectionByUrl;
