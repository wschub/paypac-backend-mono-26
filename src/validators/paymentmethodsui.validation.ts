import { z } from 'zod';

/**
 * Schema para crear un método de pago
 */
export const createPaymentMethodUISchema = z.object({
  body: z.object({
    method_name: z.string().min(3, 'El nombre del método debe tener al menos 3 caracteres'),
    mehtod_img: z.string().url('Debe ser una URL válida del logo').or(z.literal('')),
    method_code: z.string().min(1).optional().nullable(),
    method_status: z.number().int().min(0).max(1).default(0), // 0: inactivo, 1: activo
    commission_pct: z.number().min(0).default(0),
    commission_amount: z.number().int().min(0).default(0),
  }),
});

/**
 * Schema para actualizar un método de pago
 */
export const updatePaymentMethodUISchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    method_name: z.string().min(3).optional(),
    mehtod_img: z.string().url().or(z.literal('')).optional(),
    method_code: z.string().min(1).optional().nullable(),
    method_status: z.number().int().min(0).max(1).optional(),
    commission_pct: z.number().min(0).optional(),
    commission_amount: z.number().int().min(0).optional(),
  }),
});

/**
 * Schema para obtener método de pago por ID
 */
export const getPaymentMethodUIByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para actualizar solo el status
 */
export const updatePaymentMethodUIStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    method_status: z.number().int().min(0).max(1),
  }),
});