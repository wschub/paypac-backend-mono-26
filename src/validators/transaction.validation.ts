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
 */
export const processTransactionSchema = z.object({
  body: z.object({
    user_id: z
      .number({ message: 'El user_id es requerido y debe ser un número' })
      .int()
      .positive(),
    user_uid: z.string().min(1, 'El user_uid es requerido'),
    user_num_doc: z.string().min(1, 'El número de documento es requerido'),
    user_type_doc: z.string().min(1, 'El tipo de documento es requerido'),
    event_id: z
      .number({ message: 'El event_id es requerido y debe ser un número' })
      .int()
      .positive(),
    qty_items: z
      .number({ message: 'La cantidad de items es requerida' })
      .int()
      .positive(),
    apply_discount: z.number().min(0).default(0),
    amount_in_cents: z
      .number({ message: 'El monto en centavos es requerido' })
      .int()
      .positive('El monto debe ser mayor a 0'),
    status: z.string().min(1, 'El status es requerido'),
    customer_ID_phone: z.string().min(1, 'El teléfono del cliente es requerido'),
    codeDCTO: z.string().default(''),
    paymentMethodType: z.string().min(1, 'El tipo de método de pago es requerido'),
    token_card_user: z.string().min(1, 'El token de la tarjeta es requerido'),
    installments_user: z
      .number({ message: 'Las cuotas deben ser un número' })
      .int()
      .min(1)
      .max(36)
      .default(1),
    shoppingCart: z
      .array(z.any())
      .min(1, 'El carrito no puede estar vacío'),
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