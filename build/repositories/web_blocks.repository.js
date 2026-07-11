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
exports.WebBlocksRepository = void 0;
const client_1 = require("../prisma/client");
// ─── WebBlockIndex ────────────────────────────────────────────────────────────
class WebBlocksRepository {
    constructor() {
        // Incluye eventos y slides anidados en cada bloque
        this.fullInclude = {
            country: { select: { id: true, name_country: true, code: true } },
            events: {
                include: {
                    event: {
                        select: {
                            id: true,
                            public_id: true,
                            public_url: true,
                            name: true,
                            image: true,
                            cover: true,
                            short_description: true,
                            date_event: true,
                            place_address: true,
                            status: true,
                            featured: true,
                        },
                    },
                },
            },
            slides: {
                include: {
                    event: {
                        select: {
                            id: true,
                            public_id: true,
                            public_url: true,
                            name: true,
                        },
                    },
                },
            },
        };
    }
    // ── Index ──────────────────────────────────────────────────────────────────
    findAll(countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockIndex.findMany({
                where: Object.assign({ block_active: 1 }, (countryId ? { country_id: countryId } : {})),
                include: this.fullInclude,
                orderBy: { block_order: 'asc' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockIndex.findUnique({
                where: { id },
                include: this.fullInclude,
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockIndex.create({
                data,
                include: this.fullInclude,
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockIndex.update({
                where: { id },
                data,
                include: this.fullInclude,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockIndex.delete({ where: { id } });
        });
    }
    // ── WebBlockEvents ─────────────────────────────────────────────────────────
    addEvent(blockId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockEvents.create({
                data: { block_id: blockId, event_id: eventId },
                include: {
                    event: {
                        select: {
                            id: true, public_id: true, public_url: true,
                            name: true, image: true, cover: true,
                            short_description: true, date_event: true, status: true,
                        },
                    },
                },
            });
        });
    }
    removeEvent(blockId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockEvents.deleteMany({
                where: { block_id: blockId, event_id: eventId },
            });
        });
    }
    findBlockEvent(blockId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockEvents.findUnique({
                where: { block_id_event_id: { block_id: blockId, event_id: eventId } },
            });
        });
    }
    // ── WebBlockSlideImgs ──────────────────────────────────────────────────────
    addSlide(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockSlideImgs.create({
                data,
                include: {
                    event: { select: { id: true, public_id: true, public_url: true, name: true } },
                },
            });
        });
    }
    updateSlide(slideId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockSlideImgs.update({
                where: { id: slideId },
                data,
                include: {
                    event: { select: { id: true, public_id: true, public_url: true, name: true } },
                },
            });
        });
    }
    removeSlide(slideId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockSlideImgs.delete({ where: { id: slideId } });
        });
    }
    findSlide(slideId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.webBlockSlideImgs.findUnique({ where: { id: slideId } });
        });
    }
}
exports.WebBlocksRepository = WebBlocksRepository;
