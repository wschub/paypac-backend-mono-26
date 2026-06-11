# NEQUI

El usuario solo ingresa su celular Nequi. Recibe una **notificación push en la app
de Nequi** donde aprueba o rechaza. No hay redirección ni formularios extra.

## Datos a pedir al usuario

- Celular colombiano de 10 dígitos registrado en Nequi.

## Payload a `POST /api/transactions/process`

```json
{
  "user_id": 45,
  "user_uid": "firebase-uid",
  "user_num_doc": "1020304050",
  "user_type_doc": "CC",
  "customer_ID_phone": "3001234567",
  "invoice_id": 123,
  "sale_channel": "APP",
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3107654321"
  }
}
```

## Respuesta

`next_action.type = "NONE"` → mostrar mensaje *"Revisa tu app Nequi y aprueba el
pago"* + estado "esperando confirmación". El resultado llega por socket
`transaction:updated` cuando el usuario actúe en su celular.

Sugerencia UI: timeout visual de ~2-3 minutos con opción de "consultar estado".

## Datos de prueba (Sandbox)

| Celular | Resultado |
|---|---|
| `3991111111` | APPROVED |
| `3992222222` | DECLINED |
| Cualquier otro | ERROR |
