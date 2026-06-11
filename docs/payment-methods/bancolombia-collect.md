# BANCOLOMBIA_COLLECT — Pago en efectivo (Corresponsal Bancario Bancolombia)

El usuario recibe un **número de convenio** y una **referencia de pago** para
consignar en efectivo en cualquiera de los +15.000 corresponsales Bancolombia.

⚠️ **El pago no es inmediato**: la transacción queda `PENDING` hasta que el usuario
consigne (puede pasar horas/días o no pagar nunca). La factura queda emitida y los
tickets solo se generan cuando llega el `APPROVED` por webhook. Tener en cuenta la
fecha del evento y la expiración configurada.

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
    "type": "BANCOLOMBIA_COLLECT"
  }
}
```

No requiere campos adicionales.

## Respuesta

`next_action.type = "CASH_REFERENCE"` con:

```json
{
  "business_agreement_code": "12345",
  "payment_intention_identifier": "65770204276"
}
```

UI sugerida: pantalla con ambos códigos en grande + botón copiar + instrucciones
*"Presenta el convenio {business_agreement_code} y la referencia
{payment_intention_identifier} en cualquier Corresponsal Bancario Bancolombia"*.
También mostrar la compra como "pendiente de pago" en el historial.

El resultado llega por socket `transaction:updated` cuando el usuario consigne
(la app debe manejarlo aunque esté en background — llega push de tickets creados).
