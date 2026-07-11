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
exports.WebBlocksService = void 0;
const web_blocks_repository_1 = require("../repositories/web_blocks.repository");
const client_1 = require("../prisma/client");
const repo = new web_blocks_repository_1.WebBlocksRepository();
class WebBlocksService {
    // ── WebBlockIndex ──────────────────────────────────────────────────────────
    getAll(countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return repo.findAll(countryId);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(id);
            if (!block)
                throw new Error('Bloque no encontrado');
            return block;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield client_1.prisma.countries.findUnique({ where: { id: data.country_id } });
            if (!country)
                throw new Error('País no encontrado');
            const existing = yield client_1.prisma.webBlockIndex.findUnique({
                where: { block_identifier: data.block_identifier },
            });
            if (existing)
                throw new Error(`El identificador '${data.block_identifier}' ya está en uso`);
            return repo.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(id);
            if (!block)
                throw new Error('Bloque no encontrado');
            if (data.country_id) {
                const country = yield client_1.prisma.countries.findUnique({ where: { id: data.country_id } });
                if (!country)
                    throw new Error('País no encontrado');
            }
            if (data.block_identifier) {
                const duplicate = yield client_1.prisma.webBlockIndex.findFirst({
                    where: { block_identifier: data.block_identifier, id: { not: id } },
                });
                if (duplicate)
                    throw new Error(`El identificador '${data.block_identifier}' ya está en uso`);
            }
            return repo.update(id, data);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(id);
            if (!block)
                throw new Error('Bloque no encontrado');
            yield repo.delete(id);
        });
    }
    // ── WebBlockEvents ─────────────────────────────────────────────────────────
    addEvent(blockId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(blockId);
            if (!block)
                throw new Error('Bloque no encontrado');
            const event = yield client_1.prisma.event.findUnique({ where: { id: eventId } });
            if (!event)
                throw new Error('Evento no encontrado');
            const existing = yield repo.findBlockEvent(blockId, eventId);
            if (existing)
                throw new Error('El evento ya está en este bloque');
            return repo.addEvent(blockId, eventId);
        });
    }
    removeEvent(blockId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(blockId);
            if (!block)
                throw new Error('Bloque no encontrado');
            const existing = yield repo.findBlockEvent(blockId, eventId);
            if (!existing)
                throw new Error('El evento no está en este bloque');
            yield repo.removeEvent(blockId, eventId);
        });
    }
    // ── WebBlockSlideImgs ──────────────────────────────────────────────────────
    addSlide(blockId, imageUrl, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield repo.findById(blockId);
            if (!block)
                throw new Error('Bloque no encontrado');
            if (eventId) {
                const event = yield client_1.prisma.event.findUnique({ where: { id: eventId } });
                if (!event)
                    throw new Error('Evento no encontrado');
            }
            return repo.addSlide({ block_id: blockId, image_url: imageUrl, event_id: eventId !== null && eventId !== void 0 ? eventId : null });
        });
    }
    updateSlide(blockId, slideId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const slide = yield repo.findSlide(slideId);
            if (!slide || slide.block_id !== blockId)
                throw new Error('Slide no encontrado en este bloque');
            if (data.event_id) {
                const event = yield client_1.prisma.event.findUnique({ where: { id: data.event_id } });
                if (!event)
                    throw new Error('Evento no encontrado');
            }
            return repo.updateSlide(slideId, data);
        });
    }
    removeSlide(blockId, slideId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slide = yield repo.findSlide(slideId);
            if (!slide || slide.block_id !== blockId)
                throw new Error('Slide no encontrado en este bloque');
            yield repo.removeSlide(slideId);
        });
    }
}
exports.WebBlocksService = WebBlocksService;
