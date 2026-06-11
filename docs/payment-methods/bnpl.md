# BANCOLOMBIA_BNPL — Compra ahora, paga después (4 cuotas sin interés)

Crédito de libre inversión Bancolombia, sin intereses, en 4 cuotas mensuales.
**Solo para compras desde $100.000 COP** (el backend rechaza montos menores —
mostrar la opción únicamente si `invoice.total >= 100000`).

## Datos a pedir al usuario

- Nombres y apellidos
- Tipo y número de documento
- Celular + indicativo

## Payload a `POST /api/transactions/process`

```json
{
  "user_id": 45,
  "user_uid": "firebase-uid",
  "user_num_doc": "1020304050",
  "user_type_doc": "CC",
  "customer_ID_phone": "3001234567",
  "invoice_id": 123,
  "sale_channel": "WEB",
  "redirect_url": "https://paypac.co/pago/resultado",
  "payment_method": {
    "type": "BANCOLOMBIA_BNPL",
    "name": "Pedro",
    "last_name": "Pérez",
    "user_legal_id_type": "CC",
    "user_legal_id": "1020304050",
    "phone_number": "3222222222",
    "phone_code": "+57",
    "redirect_url": "https://paypac.co/pago/resultado",
    "payment_description": "Boletas PayPac"
  }
}
```

`payment_description`: máx. 30 caracteres.

## Respuesta

`next_action.type = "REDIRECT_URL"` → abrir `next_action.data.async_payment_url`:
es la experiencia BNPL de Bancolombia donde el usuario solicita el crédito.

Al volver por `redirect_url`, esperar socket `transaction:updated` (la aprobación
del crédito puede tardar unos minutos).

## Datos de prueba (Sandbox)

La URL de la experiencia BNPL lleva a una página donde se elige manualmente el
estado final de la transacción.
