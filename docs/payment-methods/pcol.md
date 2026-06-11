# PCOL — Puntos Colombia

El usuario redime Puntos Colombia. Puede cubrir el **total** o ser **parcial**:
si quedó saldo, el front debe iniciar una **segunda transacción** con otro método
enviando `parent_transaction_id`.

## Paso 1 — Transacción PCOL

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
  "payment_method": { "type": "PCOL" }
}
```

`next_action.type = "REDIRECT_URL"` → abrir `data.async_payment_url` (experiencia
de redención de Puntos Colombia).

## Paso 2 — Al volver de la redención

Consultar el estado de la transacción (socket `transaction:updated` o API). En
`payment_method.extra` de la transacción Wompi vienen:

- `points_redeemed` — puntos redimidos
- `redeemed_amount_in_cents_pcol` — dinero cubierto con puntos
- `remaining_amount_in_cents` — **saldo pendiente**

Casos:

| Estado | `remaining_amount_in_cents` | Acción |
|---|---|---|
| APPROVED | 0 | Pago completo con puntos — fin |
| DECLINED / ERROR | 0 | No redimió — ofrecer pagar el total con otro método |
| (cualquiera) | > 0 | Ofrecer pagar el saldo con otro método |

## Paso 3 — Segunda transacción (saldo)

Crear una nueva transacción con el método elegido (CARD, NEQUI, PSE o
BANCOLOMBIA_TRANSFER) agregando `parent_transaction_id` dentro de `payment_method`:

```json
{
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3107654321",
    "parent_transaction_id": "1929-1666902167-47609"
  }
}
```

`parent_transaction_id` = `next_action.data.wompi_transaction_id` de la transacción PCOL.

## Datos de prueba (Sandbox)

`sandbox_status` dentro de `payment_method`: `APPROVED_ONLY_POINTS`,
`APPROVED_HALF_POINTS`, `DECLINED`, `ERROR`.

> ⚠️ Método de baja prioridad — coordinar con backend antes de implementarlo
> (la conciliación de la factura con dos transacciones requiere ajustes adicionales).
