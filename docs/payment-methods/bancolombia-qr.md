# BANCOLOMBIA_QR — QR Bancolombia

Wompi genera un QR que el usuario escanea con su app Bancolombia, Bancolombia a la
Mano o Nequi. **Recomendado solo para canal WEB** (en la app el usuario no puede
escanear un QR mostrado en el mismo celular). Solo personas naturales.

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
  "payment_method": {
    "type": "BANCOLOMBIA_QR",
    "payment_description": "Boletas PayPac evento X",
    "sandbox_status": "APPROVED"
  }
}
```

- `payment_description`: máx. 64 caracteres.
- `sandbox_status`: **solo Sandbox** — fuerza el resultado (`APPROVED`, `DECLINED`, `ERROR`).
  En producción el backend lo ignora.

## Respuesta

`next_action.type = "QR_CODE"` con:

```json
{
  "qr_id": "a3827b90-...",
  "qr_image": "PD94bWwgdmVyc2lvbj0iK....."
}
```

Renderizar así (es un SVG en base64):

```html
<img src="data:image/svg+xml;base64,{qr_image}" />
```

Mostrar el QR + mensaje "Escanéalo con tu app Bancolombia o Nequi" y esperar el
socket `transaction:updated`.
