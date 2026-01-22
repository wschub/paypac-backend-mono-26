import { z } from 'zod';

/**
 * Schema para generar signature
 */
export const signatureSchema = z.object({
  body: z.object({
    amount: z.number().int().positive('El monto debe ser positivo'),
    currency: z.string().min(3).max(3, 'La moneda debe ser un código de 3 letras (ej: COP)'),
    expiration_date: z.string().datetime('Debe ser una fecha válida ISO 8601'),
  }),
});

/**
 * Schema para procesar transacción
 */
export const processTransactionSchema = z.object({
  body: z.object({
    user_id: z.number().int().positive('El ID del usuario es requerido'),
    user_uid: z.string().min(1, 'El UID del usuario es requerido'),
    user_num_doc: z.string().min(1, 'El número de documento es requerido'),
    user_type_doc: z.string().min(1, 'El tipo de documento es requerido'),
    event_id: z.number().int().positive('El ID del evento es requerido'),
    qty_items: z.number().int().positive('La cantidad de items debe ser positiva'),
    apply_discount: z.number().int().min(0).max(1, 'Debe ser 0 o 1'),
    amount_in_cents: z.number().int().positive('El monto en centavos debe ser positivo'),
    status: z.string().optional(),
    customer_ID_phone: z.string().min(1, 'El ID del teléfono es requerido'),
    codeDCTO: z.string().optional().default(''),
    paymentMethodType: z.enum(['CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER'], {
      errorMap: () => ({ message: 'Método de pago inválido' }),
    }),
    token_card_user: z.string().min(1, 'El token de la tarjeta es requerido'),
    installments_user: z.number().int().min(1).max(36, 'Las cuotas deben estar entre 1 y 36'),
    shoppingCart: z.array(z.any()).min(1, 'El carrito debe tener al menos un item'),
  }),
});
