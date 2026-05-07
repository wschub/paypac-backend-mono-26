# PayPac Web — Resumen de Endpoints Públicos (Para Frontend)

**Base URL:** `https://paypac-backend-mono-26-production.up.railway.app`

**Auth:** Todos los endpoints requieren el header:
```
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

---

## GET /api/public/events

```
GET /api/public/events?search=rock&city=Medellín&sort_by=price_asc&page=1&limit=20
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

Query params opcionales: `search`, `date_from` (YYYY-MM-DD), `date_to`, `city`, `category_id` (ej: "1,2,3"), `sort_by` (date_asc | popularity | price_asc | price_desc | name_asc), `page`, `limit` (max 100)

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 12,
      "name": "Festival de Rock 2026",
      "image": "https://storage.paypac.co/events/12/image.jpg",
      "short_description": "El mejor rock en vivo de la ciudad",
      "date_event": "2026-06-15T20:00:00.000Z",
      "place_address": "Calle 10 # 43D-18, Medellín, Antioquia",
      "description": "Descripción completa del evento...",
      "cover": "https://storage.paypac.co/events/12/cover.jpg",
      "url_video": "https://youtube.com/watch?v=xyz",
      "organizer_id": 5,
      "price_from": {
        "name_locality": "General",
        "stage_name": "Preventa 1",
        "date_start": "2026-05-01T00:00:00.000Z",
        "date_end": "2026-06-10T23:59:00.000Z",
        "price_ticket": 85000
      }
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```
> `price_from` puede ser `null` (eventos sin stage activo)

---

## GET /api/public/events/:id

```
GET /api/public/events/12
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

**Respuesta 200:**
```json
{
  "data": {
    "id": 12,
    "name": "Festival de Rock 2026",
    "image": "https://storage.paypac.co/events/12/image.jpg",
    "short_description": "El mejor rock en vivo de la ciudad",
    "date_event": "2026-06-15T20:00:00.000Z",
    "place_address": "Calle 10 # 43D-18, Medellín, Antioquia",
    "description": "Descripción completa del evento con detalles...",
    "cover": "https://storage.paypac.co/events/12/cover.jpg",
    "url_video": "https://youtube.com/watch?v=xyz",
    "organizer_id": 5,
    "price_from": {
      "name_locality": "General",
      "stage_name": "Preventa 1",
      "date_start": "2026-05-01T00:00:00.000Z",
      "date_end": "2026-06-10T23:59:00.000Z",
      "price_ticket": 85000
    }
  }
}
```

**Error 404:** Evento no existe, privado o cancelado (siempre 404 genérico)

---

## GET /api/public/events/:eventId/localities

```
GET /api/public/events/12/localities
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 3,
      "event_id": 12,
      "name_locality": "VIP",
      "bkg_color": "#1A1A2E",
      "title_color": "#FFFFFF",
      "text_color": "#CCCCCC",
      "title_color_location": "#FFD700",
      "createdAt": "2026-01-10T15:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z",
      "stages": [
        {
          "id": 7,
          "locality_id": 3,
          "stage_name": "Preventa 1",
          "date_start": "2026-03-01T00:00:00.000Z",
          "date_end": "2026-06-15T23:59:00.000Z",
          "price_ticket": 150000,
          "createdAt": "2026-01-10T15:00:00.000Z",
          "updatedAt": "2026-02-01T10:00:00.000Z"
        }
      ]
    }
  ],
  "total": 2
}
```
> Cada localidad incluye exactamente 1 stage (el activo ahora)

---

## GET /api/public/categories

```
GET /api/public/categories?search=con
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

Query params opcionales: `search`

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "category_name": "Conciertos",
      "category_icon": "https://storage.paypac.co/icons/conciertos.svg",
      "country_id": 1,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

## GET /api/public/subcategories/by-category/:categoryId

```
GET /api/public/subcategories/by-category/1
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 5,
      "category_id": 1,
      "subcategory_name": "Rock",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

## GET /api/public/subgenres

```
GET /api/public/subgenres?subcategory_id=5
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

Query params opcionales: `search`, `subcategory_id`, `category_id`

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 10,
      "subcategory_id": 5,
      "subcategory_name": "Rock Alternativo",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

## GET /api/public/cities

```
GET /api/public/cities
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
```

Query params opcionales: `country_id` (default: 1 = Colombia)

**Respuesta 200:**
```json
{
  "data": [
    { "id": 2, "name_city": "Bogotá", "country_id": 1 },
    { "id": 3, "name_city": "Cali", "country_id": 1 },
    { "id": 1, "name_city": "Medellín", "country_id": 1 }
  ],
  "total": 3
}
```

---

## POST /api/public/events/:id/view

```
POST /api/public/events/12/view
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
Content-Type: application/json
```

**Body:**
```json
{
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "session_channel": "WEB",
  "user_id": null,
  "country_id": 1,
  "city_id": 5
}
```
> `session_token`: UUID v4 generado en frontend. `user_id` solo si está logueado.

**Respuesta 201 (nueva vista):**
```json
{
  "id": 456,
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "message": "View created"
}
```

**Respuesta 200 (ya existe):**
```json
{
  "id": 456,
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "message": "View already exists"
}
```

---

## PATCH /api/public/events/:id/view/:sessionToken

```
PATCH /api/public/events/12/view/550e8400-e29b-41d4-a716-446655440000
X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789
Content-Type: application/json
```

**Body:**
```json
{
  "duration": 145
}
```
> `duration`: segundos a acumular (se suma al total)

**Respuesta 200:**
```json
{
  "message": "Duration updated",
  "total_duration": 145
}
```

---

## POST /api/events/:id/view/conversion ⚠️ REQUIERE AUTH FIREBASE

```
POST /api/events/12/view/conversion
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

> Este endpoint requiere autenticación Firebase (usuario logueado con rol CUSTOMER). Se llama después de crear una factura/compra.

**Body:**
```json
{
  "session_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Respuesta 200:**
```json
{
  "message": "Conversion marked"
}
```

---

## Endpoints que requieren auth Firebase (sin cambios)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| /api/auth/register | POST | Crear cuenta |
| /api/auth/login | POST | Iniciar sesión |
| /api/auth/me | GET | Perfil del usuario |
| /api/payment-cards | GET | Listar tarjetas |
| /api/payment-cards | POST | Guardar tarjeta |
| /api/invoices | POST | Comprar tickets |
| /api/tickets/my-tickets | GET | Historial de tickets |
| /api/discounts/validate/:code | GET | Validar código de descuento |
