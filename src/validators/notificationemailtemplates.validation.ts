import { z } from 'zod';

/**
 * Schema para crear un template de email
 */
export const createEmailTemplateSchema = z.object({
  body: z.object({
    template_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    template_subject: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
    template_code: z.string().min(3, 'El código debe tener al menos 3 caracteres').toUpperCase(),
    template_type: z.enum([
      'REGISTRATION',
      'PASSWORD_RESET',
      'EVENT_NOTIFICATION',
      'TRANSACTION',
      'PROMOTER_UPDATE',
      'MARKETING',
    ]),
    template_variables: z.array(z.string()).default([]),
  }),
});

/**
 * Schema para actualizar un template
 */
export const updateEmailTemplateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    template_name: z.string().min(3).optional(),
    template_subject: z.string().min(3).optional(),
    template_code: z.string().min(3).toUpperCase().optional(),
    template_type: z.enum([
      'REGISTRATION',
      'PASSWORD_RESET',
      'EVENT_NOTIFICATION',
      'TRANSACTION',
      'PROMOTER_UPDATE',
      'MARKETING',
    ]).optional(),
    template_variables: z.array(z.string()).optional(),
  }),
});

/**
 * Schema para obtener template por ID
 */
export const getEmailTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener templates por tipo
 */
export const getEmailTemplatesByTypeSchema = z.object({
  query: z.object({
    template_type: z.enum([
      'REGISTRATION',
      'PASSWORD_RESET',
      'EVENT_NOTIFICATION',
      'TRANSACTION',
      'PROMOTER_UPDATE',
      'MARKETING',
    ]).optional(),
  }).optional(),
});