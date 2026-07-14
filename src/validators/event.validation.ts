import { z } from 'zod';

/**
 * Schema para crear un evento
 */
export const createEventSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    short_description: z.string().min(10, 'La descripción corta debe tener al menos 10 caracteres'),
    description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
    image: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    cover: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    date_event: z.string().datetime('Debe ser una fecha válida ISO 8601'),
    place_address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    category_id: z.number().int().positive('La categoría es requerida'),
    subcategory_id: z.number().int().positive('La subcategoría es requerida'),
    subgenre_id: z.number().int().positive().optional().nullable(),
    latitude: z.string().optional().or(z.literal('')),
    longitude: z.string().optional().or(z.literal('')),
    city: z.string().min(2, 'La ciudad es requerida'),
    country: z.string().min(2, 'El país es requerido'),
    currency: z.string().default('COP'),
    event_type: z.enum(['PUBLICO', 'PRIVADO']).default('PUBLICO'),
    type_venue: z.enum(['NUMERADO', 'SIN_NUMERAR']).default('SIN_NUMERAR'),
    date_type: z.enum(['SINGLE', 'MULTIPLE', 'RANGE_DATE', 'RANGE_DATE_EXCEPT', 'EXPLICIT_DATES']).default('SINGLE'),
    url_video: z.string().url().optional().or(z.literal('')),
    num_max_tickets: z.number().int().positive('El número máximo de tickets debe ser positivo').optional().default(0),

    // Configuración de negocio
    apply_dcto: z.boolean().default(false),
    allow_external_promoters: z.boolean().default(false),
    allow_paypac_promotion: z.boolean().default(false),
    sales_channel: z.string().default('app'),
    commission_to_charge: z.number().min(0).max(100).default(0),
    commission_to_promoter: z.number().min(0).max(100).default(0),
    
    // Lugar numerado (opcional)
    numbered_place_id: z.number().int().positive().optional().nullable(),
  }),
});

/**
 * Schema para actualizar un evento
 */
export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    short_description: z.string().min(10).optional(),
    description: z.string().min(20).optional(),
    image: z.string().url().optional().or(z.literal('')),
    cover: z.string().url().optional().or(z.literal('')),
    date_event: z.string().datetime().optional(),
    place_address: z.string().min(5).optional(),
    category_id: z.number().int().positive().optional(),
    subcategory_id: z.number().int().positive().optional().nullable(),
    subgenre_id: z.number().int().positive().optional().nullable(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    currency: z.string().optional(),
    event_type: z.enum(['PUBLICO', 'PRIVADO']).optional(),
    type_venue: z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
    date_type: z.enum(['SINGLE', 'MULTIPLE', 'RANGE_DATE', 'RANGE_DATE_EXCEPT', 'EXPLICIT_DATES']).optional(),
    url_video: z.string().url().optional().or(z.literal('')),
    num_max_tickets: z.number().int().positive().optional(),
    
    apply_dcto: z.boolean().optional(),
    allow_external_promoters: z.boolean().optional(),
    allow_paypac_promotion: z.boolean().optional(),
    sales_channel: z.string().optional(),
    commission_to_charge: z.number().min(0).max(100).optional(),
    commission_to_promoter: z.number().min(0).max(100).optional(),
    
    numbered_place_id: z.number().int().positive().optional().nullable(),
  }),
});

/**
 * Schema para obtener evento por ID
 */
export const getEventByIdSchema = z.object({
  params: z.object({
    id: z.string().refine(
      (val) => /^\d+$/.test(val) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      'El id debe ser numérico o un public_id UUID'
    ),
  }),
});

/**
 * Schema para actualizar el status del evento
 */
export const updateEventStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    status: z.enum([
      'CREATED',
      'APPROVED',
      'SCHEDULED',
      'ACTIVE',
      'CANCELED',
      'RE_SCHEDULED',
      'FINALIZED',
    ]),
  }),
});

/**
 * Schema para validar query params en GET /events
 */
const EVENT_STATUS_VALUES = [
  'CREATED', 'APPROVED', 'SCHEDULED', 'ACTIVE',
  'CANCELED', 'RE_SCHEDULED', 'FINALIZED',
] as const;

export const getEventsQuerySchema = z.object({
  query: z.object({
    status: z.string()
      .optional()
      .refine(
        (val) => !val || val.split(',').every(s => EVENT_STATUS_VALUES.includes(s as any)),
        { message: `Status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}` }
      ),
    event_type: z.enum(['PUBLICO', 'PRIVADO']).optional(),
    category_id: z.string().regex(/^\d+$/).optional(),
    subcategory_id: z.string().regex(/^\d+$/).optional(), // ← agregar
    subgenre_id:    z.string().regex(/^\d+$/).optional(), // ← agregar
    country: z.string().optional(),
    city: z.string().optional(),
    search: z.string().optional(),
    date_from:      z.string().datetime().optional(),     // ← agregar
    date_to:        z.string().datetime().optional(),     // ← agregar
    latitude:       z.string().optional(),                // ← agregar
    longitude:      z.string().optional(),    
    allow_external_promoters: z.enum(['true', 'false']).optional(),            // ← agregar
  }).optional(),
});