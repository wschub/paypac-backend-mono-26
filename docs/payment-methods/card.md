# CARD — Tarjeta de crédito / débito

Visa, MasterCard y American Express con CVC. El front **tokeniza** la tarjeta
directamente contra Wompi con la **llave pública** (los datos de la tarjeta nunca
pasan por nuestro backend) y envía el token resultante.

## Paso 0a — Checkboxes de aceptación (obligatorio)

En la pantalla donde se agrega/guarda la tarjeta deben aparecer los **dos
checkboxes de aceptación de Wompi** (términos y condiciones + tratamiento de
datos personales) con los links de `GET /api/transactions/acceptance-contracts`.
No permitir tokenizar ni pagar sin ambos marcados. Ver README §2.5.

## Paso 0b — Tokenizar la tarjeta (front → Wompi)

```
POST {WOMPI_URL}/tokens/cards
Authorization: Bearer <LLAVE_PUBLICA pub_test_/pub_prod_>
```
```json
{
  "number": "4242424242424242",
  "cvc": "123",
  "exp_month": "08",
  "exp_year": "28",
  "card_holder": "José Pérez"
}
```

Guardar `data.id` (`tok_...`). Un token es de un solo uso. Preguntar al usuario
el número de cuotas.

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
    "type": "CARD",
    "token": "tok_test_1_BBb749EAB32e97a2D058Dd538a608301",
    "installments": 2
  }
}
```

## Respuesta

`next_action.type = "NONE"` → mostrar pantalla "procesando pago" y esperar el
socket `transaction:updated` (APPROVED/DECLINED en segundos).

## Datos de prueba (Sandbox)

| Tarjeta | Resultado |
|---|---|
| `4242 4242 4242 4242` | APPROVED |
| `4111 1111 1111 1111` | DECLINED |
| Cualquier otra | ERROR |

Fecha futura cualquiera y CVC de 3 dígitos.
