"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlocksQuerySchema = exports.updateSlideSchema = exports.addSlideSchema = exports.addEventSchema = exports.updateBlockSchema = exports.createBlockSchema = void 0;
const zod_1 = require("zod");
const BLOCK_TYPES = ['EVENT', 'BANNER', 'SLIDE', 'CAROUSEL', 'CUSTOM', 'CATEGORY'];
exports.createBlockSchema = zod_1.z.object({
    body: zod_1.z.object({
        country_id: zod_1.z.number().int().positive({ message: 'country_id es requerido' }),
        title: zod_1.z.string().min(1).max(255),
        type: zod_1.z.enum(BLOCK_TYPES),
        block_order: zod_1.z.number().int().min(0),
        block_identifier: zod_1.z.string().min(1).max(100, { message: 'block_identifier máximo 100 caracteres' }),
        block_config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        block_active: zod_1.z.number().int().min(0).max(1).optional(),
        banner_img: zod_1.z.string().url().optional(),
        banner_text: zod_1.z.string().max(500).optional(),
        banner_link: zod_1.z.string().url().optional(),
    }),
});
exports.updateBlockSchema = zod_1.z.object({
    body: zod_1.z.object({
        country_id: zod_1.z.number().int().positive().optional(),
        title: zod_1.z.string().min(1).max(255).optional(),
        type: zod_1.z.enum(BLOCK_TYPES).optional(),
        block_order: zod_1.z.number().int().min(0).optional(),
        block_identifier: zod_1.z.string().min(1).max(100).optional(),
        block_config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).nullable().optional(),
        block_active: zod_1.z.number().int().min(0).max(1).optional(),
        banner_img: zod_1.z.string().url().nullable().optional(),
        banner_text: zod_1.z.string().max(500).nullable().optional(),
        banner_link: zod_1.z.string().url().nullable().optional(),
    }),
});
exports.addEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive({ message: 'event_id es requerido' }),
    }),
});
exports.addSlideSchema = zod_1.z.object({
    body: zod_1.z.object({
        image_url: zod_1.z.string().url({ message: 'image_url debe ser una URL válida' }),
        event_id: zod_1.z.number().int().positive().nullable().optional(),
    }),
});
exports.updateSlideSchema = zod_1.z.object({
    body: zod_1.z.object({
        image_url: zod_1.z.string().url().optional(),
        event_id: zod_1.z.number().int().positive().nullable().optional(),
    }),
});
exports.getBlocksQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        country_id: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});
