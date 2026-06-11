# BANCOLOMBIA_TRANSFER — Botón de Transferencia Bancolombia

Pago desde cuenta de ahorros o corriente Bancolombia (solo persona natural).
El front redirige al portal Bancolombia con la URL que devuelve el backend.

## Datos a pedir al usuario

Ninguno adicional — solo la confirmación de pagar con Bancolombia.

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
    "type": "BANCOLOMBIA_TRANSFER",
    "payment_description": "Boletas PayPac evento X",
    "ecommerce_url": "https://paypac.co/pago/resultado"
  }
}
```

- `payment_description`: máx. 64 caracteres, **sin comillas simples**.
- `ecommerce_url` (opcional): salta la pantalla resumen de Wompi y vuelve directo
  a nuestra página.

## Respuesta

`next_action.type = "REDIRECT_URL"` → abrir `next_action.data.async_payment_url`
(web: location.href; app: Custom Tab + deep link de vuelta).

Resultado final por socket `transaction:updated`.

## Datos de prueba (Sandbox)

Tras crear la transacción, la `async_payment_url` lleva a una pantalla de Wompi
donde se elige manualmente el estado final (APPROVED / DECLINED / ERROR).
