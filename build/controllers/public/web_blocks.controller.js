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
exports.removeSlide = exports.updateSlide = exports.addSlideToBlock = exports.removeEventFromBlock = exports.addEventToBlock = exports.deleteBlock = exports.updateBlock = exports.createBlock = exports.getBlockById = exports.getBlocks = void 0;
const web_blocks_service_1 = require("../../services/web_blocks.service");
const service = new web_blocks_service_1.WebBlocksService();
// ── WebBlockIndex ─────────────────────────────────────────────────────────────
const getBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countryId = req.query.country_id ? Number(req.query.country_id) : undefined;
        const blocks = yield service.getAll(countryId);
        res.status(200).json({ blocks });
    }
    catch (error) {
        console.error('Error in getBlocks:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch blocks' });
    }
});
exports.getBlocks = getBlocks;
const getBlockById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const block = yield service.getById(id);
        res.status(200).json({ block });
    }
    catch (error) {
        console.error('Error in getBlockById:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch block' });
    }
});
exports.getBlockById = getBlockById;
const createBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const block = yield service.create(req.body);
        res.status(201).json({ block });
    }
    catch (error) {
        console.error('Error in createBlock:', error);
        if (error.message.includes('ya está en uso')) {
            return res.status(409).json({ error: 'Conflict', message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to create block' });
    }
});
exports.createBlock = createBlock;
const updateBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const block = yield service.update(id, req.body);
        res.status(200).json({ block });
    }
    catch (error) {
        console.error('Error in updateBlock:', error);
        if (error.message.includes('ya está en uso')) {
            return res.status(409).json({ error: 'Conflict', message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to update block' });
    }
});
exports.updateBlock = updateBlock;
const deleteBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield service.delete(id);
        res.status(200).json({ message: 'Bloque eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error in deleteBlock:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to delete block' });
    }
});
exports.deleteBlock = deleteBlock;
// ── WebBlockEvents ────────────────────────────────────────────────────────────
const addEventToBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockId = parseInt(req.params.id);
        const { event_id } = req.body;
        const entry = yield service.addEvent(blockId, event_id);
        res.status(201).json({ entry });
    }
    catch (error) {
        console.error('Error in addEventToBlock:', error);
        if (error.message.includes('ya está')) {
            return res.status(400).json({ error: 'Bad request', message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to add event' });
    }
});
exports.addEventToBlock = addEventToBlock;
const removeEventFromBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockId = parseInt(req.params.id);
        const eventId = parseInt(req.params.eventId);
        yield service.removeEvent(blockId, eventId);
        res.status(200).json({ message: 'Evento eliminado del bloque' });
    }
    catch (error) {
        console.error('Error in removeEventFromBlock:', error);
        if (error.message.includes('no encontrado') || error.message.includes('no está')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to remove event' });
    }
});
exports.removeEventFromBlock = removeEventFromBlock;
// ── WebBlockSlideImgs ─────────────────────────────────────────────────────────
const addSlideToBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockId = parseInt(req.params.id);
        const { image_url, event_id } = req.body;
        const slide = yield service.addSlide(blockId, image_url, event_id !== null && event_id !== void 0 ? event_id : null);
        res.status(201).json({ slide });
    }
    catch (error) {
        console.error('Error in addSlideToBlock:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to add slide' });
    }
});
exports.addSlideToBlock = addSlideToBlock;
const updateSlide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockId = parseInt(req.params.id);
        const slideId = parseInt(req.params.slideId);
        const slide = yield service.updateSlide(blockId, slideId, req.body);
        res.status(200).json({ slide });
    }
    catch (error) {
        console.error('Error in updateSlide:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to update slide' });
    }
});
exports.updateSlide = updateSlide;
const removeSlide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockId = parseInt(req.params.id);
        const slideId = parseInt(req.params.slideId);
        yield service.removeSlide(blockId, slideId);
        res.status(200).json({ message: 'Slide eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error in removeSlide:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Failed to remove slide' });
    }
});
exports.removeSlide = removeSlide;
