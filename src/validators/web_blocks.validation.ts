import { z } from 'zod';

const BLOCK_TYPES = ['EVENT', 'BANNER', 'SLIDE', 'CAROUSEL', 'CUSTOM', 'CATEGORY'] as const;

export const createBlockSchema = z.object({
  body: z.object({
    country_id:       z.number().int().positive({ message: 'country_id es requerido' }),
    title:            z.string().min(1).max(255),
    type:             z.enum(BLOCK_TYPES),
    block_order:      z.number().int().min(0),
    block_identifier: z.string().min(1).max(100, { message: 'block_identifier máximo 100 caracteres' }),
    block_config:     z.record(z.string(), z.any()).optional(),
    block_active:     z.number().int().min(0).max(1).optional(),
    banner_img:       z.string().url().optional(),
    banner_text:      z.string().max(500).optional(),
    banner_link:      z.string().url().optional(),
  }),
});

export const updateBlockSchema = z.object({
  body: z.object({
    country_id:       z.number().int().positive().optional(),
    title:            z.string().min(1).max(255).optional(),
    type:             z.enum(BLOCK_TYPES).optional(),
    block_order:      z.number().int().min(0).optional(),
    block_identifier: z.string().min(1).max(100).optional(),
    block_config:     z.record(z.string(), z.any()).nullable().optional(),
    block_active:     z.number().int().min(0).max(1).optional(),
    banner_img:       z.string().url().nullable().optional(),
    banner_text:      z.string().max(500).nullable().optional(),
    banner_link:      z.string().url().nullable().optional(),
  }),
});

export const addEventSchema = z.object({
  body: z.object({
    event_id: z.number().int().positive({ message: 'event_id es requerido' }),
  }),
});

export const addSlideSchema = z.object({
  body: z.object({
    image_url: z.string().url({ message: 'image_url debe ser una URL válida' }),
    event_id:  z.number().int().positive().nullable().optional(),
  }),
});

export const updateSlideSchema = z.object({
  body: z.object({
    image_url: z.string().url().optional(),
    event_id:  z.number().int().positive().nullable().optional(),
  }),
});

export const getBlocksQuerySchema = z.object({
  query: z.object({
    country_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
