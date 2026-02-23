import { z } from 'zod';

const locationFields = {
  country_id: z
    .number({ message: 'El country_id debe ser un número' })
    .int().positive().optional(),
  state_id: z
    .number({ message: 'El state_id debe ser un número' })
    .int().positive().optional(),
  city_id: z
    .number({ message: 'El city_id debe ser un número' })
    .int().positive().optional(),
};

/**
 * Schema para crear una empresa
 */
export const createCompanySchema = z.object({
  body: z.object({
    company_name: z
      .string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
    company_description: z.string().optional(),
    company_logo: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    company_cover: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    company_phone_number: z.string().optional(),
    company_email: z.string().email('Debe ser un email válido').optional(),
    type_identification: z.string().optional(),
    num_identification: z.string().optional(),
    website: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    address: z.string().optional(),
    company_presentation: z.string().optional(),
    ...locationFields,
  }),
});

/**
 * Schema para actualizar una empresa
 */
export const updateCompanySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      company_name: z.string().min(2).optional(),
      company_description: z.string().optional(),
      company_logo: z.string().url().optional().or(z.literal('')),
      company_cover: z.string().url().optional().or(z.literal('')),
      company_phone_number: z.string().optional(),
      company_email: z.string().email().optional(),
      type_identification: z.string().optional(),
      num_identification: z.string().optional(),
      website: z.string().url().optional().or(z.literal('')),
      address: z.string().optional(),
      company_presentation: z.string().optional(),
      ...locationFields,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener empresa por ID
 */
export const getCompanyByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para actualizar status
 */
export const updateCompanyStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    status: z
      .number({ message: 'El status debe ser un número' })
      .int()
      .min(0)
      .max(2, 'Status inválido (0: pendiente, 1: aprobado, 2: suspendido)'),
  }),
});

/**
 * Schema para filtrar empresas (query params)
 */
export const getCompaniesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      country_id: z.string().regex(/^\d+$/).optional(),
      state_id: z.string().regex(/^\d+$/).optional(),
      city_id: z.string().regex(/^\d+$/).optional(),
      status: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});

/**
 * Schema para stats
 */
export const getCompaniesStatsSchema = z.object({
  query: z
    .object({
      country_id: z.string().regex(/^\d+$/).optional(),
      status: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});