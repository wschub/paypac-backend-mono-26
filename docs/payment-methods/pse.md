# PSE — Débito desde cuenta bancaria

El usuario elige su banco, el backend crea la transacción y el front **redirige al
portal del banco** con la URL que devuelve el backend.

## Paso 1 — Listar bancos

```
GET /api/transactions/pse/financial-institutions
Authorization: Bearer <token>
```

Respuesta: `financial_institutions: [{ financial_institution_code, financial_institution_name }]`.
Mostrar selector de banco.

## Datos a pedir al usuario

- Banco (del listado anterior)
- Tipo de persona: natural (0) o jurídica (1)
- Tipo y número de documento (CC o NIT)

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
    "type": "PSE",
    "user_type": 0,
    "user_legal_id_type": "CC",
    "user_legal_id": "1020304050",
    "financial_institution_code": "1",
    "payment_description": "Boletas PayPac"
  }
}
```

`payment_description`: máximo 30 caracteres.

## Respuesta

`next_action.type = "REDIRECT_URL"` → abrir `next_action.data.async_payment_url`:

- **Web**: `window.location.href = async_payment_url`
- **App**: abrir en Custom Tab / SFSafariViewController y volver por deep link (`redirect_url`)

Al volver, **no asumir el resultado**: esperar socket `transaction:updated` o consultar
`GET /api/transactions/my-transactions`.

Si `async_payment_url` llega `null` (raro, timeout del polling interno), reintentar
consultando el estado de la transacción unos segundos después.

## Datos de prueba (Sandbox)

| `financial_institution_code` | Resultado |
|---|---|
| `"1"` | APPROVED |
| `"2"` | DECLINED |
