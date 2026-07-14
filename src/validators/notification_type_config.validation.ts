import { z } from 'zod';

export const getNotificationTypeConfigByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

export const updateNotificationTypeConfigSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      is_mandatory: z.boolean().optional(),
      channel_web: z.boolean().optional(),
      channel_push: z.boolean().optional(),
      channel_whatsapp: z.boolean().optional(),
      channel_email: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});
