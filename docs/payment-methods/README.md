# Métodos de pago PayPac — Guía para Frontend (Web y App)

Integración de pagos vía **API del backend** (nunca se llama a Wompi directamente desde el front,
excepto la tokenización de tarjeta que usa la **llave pública**).

## Flujo general (igual para todos los métodos)

```
1. GET  /api/payment-methods/active        → métodos habilitados (pintar solo estos)
2. POST /api/invoices                      → crea la factura (inicia la compra)
3. POST /api/transactions/process          → ejecuta el pago (envía invoice_id + payment_method)
4. Manejar `next_action` de la respuesta   → redirigir / QR / OTP / esperar
5. Esperar resultado final por Socket.IO   → transaction:updated, tickets:created, payment:declined
```

### 1. Listar métodos activos

```
GET /api/payment-methods/active
Authorization: Bearer <token>
```

Respuesta: lista con `method_code` (úsalo como `payment_method.type`), `method_name`,
`mehtod_img` y `method_status`. **Solo mostrar los que lleguen aquí** — el backend
rechaza métodos inactivos aunque se envíen.

### 2. Crear la factura

```
POST /api/invoices
```
```json
{
  "event_id": 12,
  "items": [{ "stage_id": 3, "locality_id": 5, "qty_tickets": 2 }],
  "sale_channel": "APP",
  "payment_method": "NEQUI",
  "user_num_doc": "1020304050",
  "user_type_doc": "CC",
  "device_uuid": "uuid-del-dispositivo",
  "discount_code": "OPCIONAL",
  "promoter_code": "OPCIONAL"
}
```

- `sale_channel`: `"WEB"` o `"APP"` según el canal. **Obligatorio enviarlo desde ya.**
- `payment_method`: el `method_code` elegido por el usuario.
- Guarda el `invoice.id` de la respuesta para el paso 3.

### 3. Procesar el pago

```
POST /api/transactions/process
```

Campos comunes a todos los métodos:

```json
{
  "user_id": 45,
  "user_uid": "firebase-uid",
  "user_num_doc": "1020304050",
  "user_type_doc": "CC",
  "customer_ID_phone": "3001234567",
  "invoice_id": 123,
  "sale_channel": "APP",
  "redirect_url": "https://paypac.co/pago/resultado",
  "payment_method": { "type": "<METODO>", "...campos específicos del método..." }
}
```

- Con `invoice_id` **no** se envían `amount_in_cents`, `event_id` ni `shoppingCart`:
  el monto sale de la factura en el backend (anti-manipulación).
- `redirect_url`: a dónde vuelve el usuario en métodos con redirección
  (en app: deep link, ej. `paypac://pago/resultado`).
- Los campos específicos de `payment_method` están en el doc de cada método.

### 4. Manejar `next_action`

La respuesta incluye `next_action` con `type`, `data` y `message`:

| `next_action.type` | Qué hacer | Métodos |
|---|---|---|
| `NONE` | Mostrar "procesando" y esperar socket | CARD, NEQUI |
| `REDIRECT_URL` | Abrir `data.async_payment_url` (browser/webview) | PSE, BANCOLOMBIA_TRANSFER, PCOL, BANCOLOMBIA_BNPL |
| `QR_CODE` | Renderizar `data.qr_image` (SVG base64) | BANCOLOMBIA_QR |
| `OTP` | Abrir `data.url` (UI Wompi) o usar `data.url_services` (UI propia) | DAVIPLATA |
| `CASH_REFERENCE` | Mostrar `data.business_agreement_code` + `data.payment_intention_identifier` | BANCOLOMBIA_COLLECT |

### 5. Resultado final (Socket.IO)

Conectarse al room del usuario y escuchar:

- `transaction:updated` — cambio de estado (`APPROVED`, `DECLINED`, `VOIDED`, `ERROR`, `PENDING`)
- `tickets:created` — tickets generados (pago aprobado)
- `payment:declined` / `payment:voided` / `payment:pending`

**Nunca** asumir el resultado por la redirección de vuelta: la fuente de verdad es el
webhook de Wompi → socket. Como respaldo, consultar `GET /api/transactions/my-transactions`.

## Documentos por método

| Método | `payment_method.type` | Doc |
|---|---|---|
| Tarjeta crédito/débito | `CARD` | [card.md](card.md) |
| Nequi | `NEQUI` | [nequi.md](nequi.md) |
| PSE | `PSE` | [pse.md](pse.md) |
| Botón Bancolombia | `BANCOLOMBIA_TRANSFER` | [bancolombia-transfer.md](bancolombia-transfer.md) |
| QR Bancolombia | `BANCOLOMBIA_QR` | [bancolombia-qr.md](bancolombia-qr.md) |
| Efectivo (Corresponsal) | `BANCOLOMBIA_COLLECT` | [bancolombia-collect.md](bancolombia-collect.md) |
| Daviplata | `DAVIPLATA` | [daviplata.md](daviplata.md) |
| BNPL Bancolombia | `BANCOLOMBIA_BNPL` | [bnpl.md](bnpl.md) |
| Puntos Colombia | `PCOL` | [pcol.md](pcol.md) |
