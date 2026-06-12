# Simulación del webhook de Wompi (Sandbox)

Endpoint:

```
POST https://paypac-backend-mono-26-production.up.railway.app/api/webhooks/wompi
Content-Type: application/json
```

## ⚠️ Correcciones importantes sobre el ejemplo base

1. **El `checksum` NO es copiable entre pruebas.** Se calcula así:

   ```
   SHA256( transaction.id + transaction.status + transaction.amount_in_cents + timestamp + SECRETO_DE_EVENTOS )
   → en HEX MAYÚSCULAS
   ```

   Si cambias el `id`, el `status`, el `amount_in_cents` o el `timestamp`, hay que
   recalcularlo con el secreto (`TEST_EVENTS` para `environment: "test"`). Si no,
   el backend responde **401 Invalid signature**.

2. **`environment` debe coincidir con el `WOMPI_MODE` del servidor.** Con
   `environment: "test"` el servidor debe estar en `WOMPI_MODE=sandbox`; si está en
   `production` responde **400 Invalid environment**.

3. **`reference` debe ser un `num_invoice` real** de una factura en estado `ISSUED`,
   o el webhook no encuentra la factura y no crea tickets (responde 200 igualmente).

4. Tu ejemplo era válido; solo le faltaba `sent_at` (opcional, no se usa) y tener en
   cuenta los 3 puntos anteriores al variar el estado.

## Forma recomendada: script con firma automática

```bash
npx tsx src/tools/simulate-wompi-webhook.ts \
  --reference INV-1780520938473-8711 \
  --method NEQUI \
  --status APPROVED \
  --amount 30000000
```

- `--method`: CARD | NEQUI | PSE | BANCOLOMBIA_TRANSFER | BANCOLOMBIA_QR | BANCOLOMBIA_COLLECT | DAVIPLATA | BANCOLOMBIA_BNPL | PCOL
- `--status`: APPROVED | DECLINED | VOIDED | ERROR | PENDING
- `--dry`: imprime el payload con checksum válido sin enviarlo (para copiar a Postman)
- `--url`: otro endpoint (ej. `http://localhost:3000/api/webhooks/wompi`)

Requiere `TEST_EVENTS` en el `.env` local **con el mismo valor** que tiene el servidor.

### Calcular el checksum a mano (para Postman)

```bash
node -e "const c=require('crypto');const [id,st,amt,ts,sec]=process.argv.slice(1);console.log(c.createHash('sha256').update(id+st+amt+ts+sec).digest('hex').toUpperCase())" \
  "TEST-TRANS-123456" "APPROVED" "30000000" "1707234645" "$TEST_EVENTS"
```

## Estructura base del payload

Todos los métodos comparten esta estructura; solo cambian `payment_method_type`
y el objeto `payment_method` (ver secciones siguientes):

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "TEST-TRANS-123456",
      "reference": "INV-1780520938473-8711",
      "status": "APPROVED",
      "amount_in_cents": 30000000,
      "currency": "COP",
      "customer_email": "david.wschu@gmail.com",
      "payment_method_type": "<METODO>",
      "payment_method": { "...ver por método..." },
      "customer_data": {
        "phone_number": "+573013732491",
        "full_name": "Juan Rodriguez",
        "legal_id": "1017165219",
        "legal_id_type": "CC"
      },
      "finalized_at": "2026-06-11T15:30:45.000Z",
      "created_at": "2026-06-11T15:25:30.000Z"
    }
  },
  "environment": "test",
  "signature": {
    "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
    "checksum": "<CALCULAR — ver arriba>"
  },
  "timestamp": 1707234645,
  "sent_at": "2026-06-11T15:30:46.000Z"
}
```

Estados a probar por método: `APPROVED` (crea tickets, invoice → PAID),
`DECLINED` (invoice → REJECTED), `VOIDED` (invoice → CANCELED), `ERROR`
(invoice → REJECTED), `PENDING` (invoice se mantiene ISSUED; usar
`"finalized_at": null`).

## `payment_method` por método de pago

### CARD

```json
{
  "type": "CARD",
  "installments": 1,
  "extra": {
    "brand": "VISA",
    "last_four": "4242",
    "name": "VISA-4242",
    "processor_response_code": "00"
  }
}
```

### NEQUI

```json
{
  "type": "NEQUI",
  "phone_number": "3991111111",
  "extra": { "transaction_id": "TEST-NEQUI-001" }
}
```

### PSE

```json
{
  "type": "PSE",
  "user_type": 0,
  "user_legal_id_type": "CC",
  "user_legal_id": "1017165219",
  "financial_institution_code": "1",
  "payment_description": "Boletas PayPac",
  "extra": {
    "async_payment_url": "https://sandbox.wompi.co/v1/pse/redirect/test",
    "return_code": "OK"
  }
}
```

### BANCOLOMBIA_TRANSFER

```json
{
  "type": "BANCOLOMBIA_TRANSFER",
  "user_type": "PERSON",
  "payment_description": "Boletas PayPac",
  "extra": {
    "async_payment_url": "https://sandbox.wompi.co/v1/bancolombia/redirect/test",
    "is_three_ds": false
  }
}
```

### BANCOLOMBIA_QR

```json
{
  "type": "BANCOLOMBIA_QR",
  "payment_description": "Boletas PayPac",
  "extra": {
    "qr_id": "a3827b90-501b-11ed-ae9b-3156df51ed75",
    "qr_image": "PD94bWwgdmVyc2lvbj0iTEST",
    "external_identifier": "d00000000000"
  }
}
```

### BANCOLOMBIA_COLLECT (efectivo)

```json
{
  "type": "BANCOLOMBIA_COLLECT",
  "extra": {
    "business_agreement_code": "12345",
    "payment_intention_identifier": "65770204276"
  }
}
```

> Probar la secuencia real: primero `PENDING` (usuario aún no consigna) y luego
> `APPROVED` con el mismo `reference` (cada envío con su propio `id`/`timestamp`/checksum).

### DAVIPLATA

```json
{
  "type": "DAVIPLATA",
  "user_legal_id": "1017165219",
  "user_legal_id_type": "CC",
  "payment_description": "Boletas PayPac",
  "extra": {
    "external_identifier": "452341",
    "daviplata_transaction_id": "452341",
    "is_three_ds": false
  }
}
```

### BANCOLOMBIA_BNPL

```json
{
  "type": "BANCOLOMBIA_BNPL",
  "name": "Juan",
  "last_name": "Rodriguez",
  "phone_code": "+57",
  "phone_number": "3013732491",
  "user_legal_id": "1017165219",
  "user_legal_id_type": "CC",
  "payment_description": "Boletas PayPac",
  "extra": {
    "url": "https://sandbox.wompi.co/v1/bnpl/redirect/test",
    "is_three_ds": false
  }
}
```

> Recuerda: `amount_in_cents` ≥ 10000000 ($100.000) para ser coherente con la regla BNPL.

### PCOL (Puntos Colombia)

```json
{
  "type": "PCOL",
  "extra": {
    "async_payment_url": "https://sandbox.wompi.co/v1/pcol/redirect/test",
    "points_redeemed": 1000,
    "remaining_amount_in_cents": 0,
    "redeemed_amount_in_cents_pcol": 30000000
  }
}
```

> Para simular redención parcial: `remaining_amount_in_cents > 0` y
> `redeemed_amount_in_cents_pcol < amount_in_cents`.

## Qué verificar después de cada envío

| Status enviado | Resultado esperado |
|---|---|
| APPROVED | Invoice → `PAID`, tickets creados, socket `tickets:created`, push FCM, `Invoice.payment_method` = método enviado |
| DECLINED | Invoice → `REJECTED`, socket `payment:declined` |
| VOIDED | Invoice → `CANCELED`, socket `payment:voided` |
| ERROR | Invoice → `REJECTED`, socket `payment:declined` |
| PENDING | Invoice sigue `ISSUED`, socket `payment:pending` |

Reenviar dos veces `APPROVED` con el mismo reference debe loguear
"WEBHOOK DUPLICADO DETECTADO" y no duplicar tickets.
