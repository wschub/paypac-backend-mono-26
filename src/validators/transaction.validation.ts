import { z } from 'zod';

/**
 * Schema para generar signature
 */
export const signatureSchema = z.object({
  body: z.object({
    amount: z
      .number({ message: 'El monto es requerido y debe ser un número' })
      .int()
      .positive('El monto debe ser mayor a 0'),
    currency: z.string().min(3, 'La moneda es requerida').max(3, 'Código de moneda inválido'),
    expiration_date: z.string().min(1, 'La fecha de expiración es requerida'),
  }),
});

/**
 * Schema para procesar transacción completa
 *
 * Dos modos:
 *  - Con invoice_id  → la factura ya existe (creada en POST /api/invoices);
 *    event_id, amount_in_cents y shoppingCart son opcionales.
 *  - Sin invoice_id  → flujo legacy; esos campos son obligatorios.
 *
 * El método de pago se envía en payment_method ({ type, ...campos del método }).
 * Por compatibilidad se acepta también paymentMethodType + token_card_user (CARD).
 */
export const processTransactionSchema = z.object({
  body: z
    .object({
      user_id: z
        .number({ message: 'El user_id es requerido y debe ser un número' })
        .int()
        .positive(),
      user_uid: z.string().min(1, 'El user_uid es requerido'),
      user_num_doc: z.string().min(1, 'El número de documento es requerido'),
      user_type_doc: z.string().min(1, 'El tipo de documento es requerido'),
      event_id: z.number().int().positive().optional(),
      qty_items: z.number().int().positive().optional(),
      apply_discount: z.number().min(0).default(0),
      amount_in_cents: z.number().int().positive().optional(),
      status: z.string().default('PENDING'),
      customer_ID_phone: z.string().min(1, 'El teléfono del cliente es requerido'),
      codeDCTO: z.string().default(''),
      // ── Método de pago polimórfico ──
      payment_method: z
        .looseObject({
          type: z.string().min(1, 'payment_method.type es requerido'),
        })
        .optional(),
      // ── Compatibilidad CARD legacy ──
      paymentMethodType: z.string().optional(),
      token_card_user: z.string().optional(),
      installments_user: z.number().int().min(1).max(36).default(1),
      shoppingCart: z.array(z.any()).optional(),
      // ── Flujo con factura existente / canal ──
      invoice_id: z.number().int().positive().optional(),
      sale_channel: z.enum(['WEB', 'APP']).optional(),
      redirect_url: z.string().url('redirect_url debe ser una URL válida').optional(),
    })
    .superRefine((body, ctx) => {
      if (!body.payment_method?.type && !body.paymentMethodType) {
        ctx.addIssue({
          code: 'custom',
          message: 'Debes enviar payment_method.type (o paymentMethodType legacy)',
          path: ['payment_method'],
        });
      }
      if (!body.invoice_id) {
        if (!body.event_id) {
          ctx.addIssue({
            code: 'custom',
            message: 'event_id es requerido cuando no se envía invoice_id',
            path: ['event_id'],
          });
        }
        if (!body.amount_in_cents) {
          ctx.addIssue({
            code: 'custom',
            message: 'amount_in_cents es requerido cuando no se envía invoice_id',
            path: ['amount_in_cents'],
          });
        }
        if (!body.shoppingCart || body.shoppingCart.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'shoppingCart es requerido cuando no se envía invoice_id',
            path: ['shoppingCart'],
          });
        }
      }
    }),
});

/**
 * Schema para obtener transacción por ID
 */
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para buscar por reference
 */
export const getTransactionByReferenceSchema = z.object({
  params: z.object({
    reference: z.string().min(1, 'La referencia es requerida'),
  }),
});

/**
 * Schema para buscar por invoice_id
 */
export const getTransactionByInvoiceIdSchema = z.object({
  params: z.object({
    invoice_id: z.string().min(1, 'El invoice_id es requerido'),
  }),
});

/**
 * Schema para filtrar por status
 */
export const getTransactionsByStatusSchema = z.object({
  params: z.object({
    status: z.enum(['APPROVED', 'PENDING', 'DECLINED', 'VOIDED', 'ERROR'], {
      error: 'Status inválido. Valores permitidos: APPROVED, PENDING, DECLINED, VOIDED, ERROR',
    }),
  }),
});