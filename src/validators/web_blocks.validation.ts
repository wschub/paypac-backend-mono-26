import { z } from 'zod';

export const createBlockSchema = z.object({
  body: z.object({
    country_id: z.number().int().positive({ message: 'country_id es requerido' }),
    title: z.string().min(1).max(255),
    type: z.enum(['EVENTOS', 'BANNER', 'SLIDE']),
    banner_img: z.string().url().optional(),
    banner_text: z.string().max(500).optional(),
    banner_link: z.string().url().optional(),
  }),
});

export const updateBlockSchema = z.object({
  body: z.object({
    country_id: z.number().int().positive().optional(),
    title: z.string().min(1).max(255).optional(),
    type: z.enum(['EVENTOS', 'BANNER', 'SLIDE']).optional(),
    banner_img: z.string().url().nullable().optional(),
    banner_text: z.string().max(500).nullable().optional(),
    banner_link: z.string().url().nullable().optional(),
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
    event_id: z.number().int().positive().nullable().optional(),
  }),
});

export const updateSlideSchema = z.object({
  body: z.object({
    image_url: z.string().url().optional(),
    event_id: z.number().int().positive().nullable().optional(),
  }),
});

export const getBlocksQuerySchema = z.object({
  query: z.object({
    country_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
