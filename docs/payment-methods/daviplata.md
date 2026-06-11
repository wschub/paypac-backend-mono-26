# DAVIPLATA

El usuario ingresa tipo y número de documento. Daviplata envía un **OTP por SMS**
al celular asociado, que el usuario debe digitar para confirmar.

## Datos a pedir al usuario

- Tipo y número de documento (asociado a su cuenta Daviplata).

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
  "redirect_url": "https://paypac.co/pago/resultado",
  "payment_method": {
    "type": "DAVIPLATA",
    "user_legal_id": "1020304050",
    "user_legal_id_type": "CC",
    "payment_description": "Boletas PayPac"
  }
}
```

`payment_description`: máx. 30 caracteres.

## Respuesta

`next_action.type = "OTP"` con dos opciones de integración:

```json
{
  "url": "https://...",
  "url_services": {
    "token": "jwt...",
    "code_otp_send": "https://...",
    "code_otp_validate": "https://..."
  }
}
```

### Opción A — UI de Wompi (rápida)
Abrir `data.url` (webview/browser): Wompi muestra la pantalla para digitar el OTP.

### Opción B — UI propia (recomendada para la app)
Construir pantalla OTP nativa usando `url_services`:

1. `POST {code_otp_validate}` con header `Authorization: Bearer {token}` y body
   `{ "code": 574829 }` → valida el OTP digitado.
2. `POST {code_otp_send}` (mismo Bearer) → reenvía el OTP. ⚠️ La respuesta trae un
   **nuevo** `access_token` en `data.authorization.access_token`: usarlo en la
   siguiente petición (los tokens son de un solo uso).
3. Límites: máximo 2 reenvíos y 2 intentos de validación.

Resultado final por socket `transaction:updated`.

## Datos de prueba (Sandbox) — códigos OTP

| OTP | Resultado |
|---|---|
| `574829` | APPROVED |
| `932015` | DECLINED |
| `186743` | DECLINED (sin saldo) |
| `999999` | ERROR |
