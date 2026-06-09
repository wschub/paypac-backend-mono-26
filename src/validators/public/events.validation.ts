import { z } from 'zod';

export const getPublicEventsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    city: z.string().optional(),
    category_id: z.string().optional(),
    sort_by: z.enum(['date_asc', 'popularity', 'price_asc', 'price_desc', 'name_asc']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }).optional(),
});

export const getPublicEventByIdParamsSchema = z.object({
  params: z.object({
    id: z.string().refine(
      (val) => /^\d+$/.test(val) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      'El id debe ser numérico o UUID'
    ),
  }),
});

export const getPublicLocalitiesParamsSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});
