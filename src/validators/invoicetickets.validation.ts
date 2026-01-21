import { z } from 'zod';

/**
 * Schema para obtener items por factura
 */
export const getInvoiceItemsSchema = z.object({
  params: z.object({
    invoiceId: z.string().regex(/^\d+$/, 'El invoiceId debe ser numérico'),
  }),
});

/**
 * Schema para obtener item por ID
 */
export const getItemByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener tickets vendidos por stage
 */
export const getTicketsSoldByStageSchema = z.object({
  params: z.object({
    stageId: z.string().regex(/^\d+$/, 'El stageId debe ser numérico'),
  }),
});

/**
 * Schema para obtener tickets vendidos por localidad
 */
export const getTicketsSoldByLocalitySchema = z.object({
  params: z.object({
    localityId: z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
  }),
});

/**
 * Schema para obtener resumen de ventas por evento
 */
export const getSalesSummaryByEventSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});