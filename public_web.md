# PayPac Web - Endpoints Públicos

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Infraestructura](#infraestructura)
3. [Sprint 1: Eventos Públicos](#sprint-1-eventos-públicos)
4. [Sprint 2: Filtros de Búsqueda](#sprint-2-filtros-de-búsqueda)
5. [Sprint 3: Event Tracking](#sprint-3-event-tracking)
6. [Endpoints sin cambios (requieren auth)](#endpoints-sin-cambios)

---

## Introducción

### Objetivo
Crear endpoints públicos para la web de PayPac (paypac.co) que permitan a usuarios **no autenticados** navegar eventos, aplicar filtros y ver detalles, incentivando el registro para comprar.

### Diferencias con endpoints existentes
- **Endpoints actuales**: Requieren autenticación Firebase + roles específicos
- **Endpoints públicos**: Solo requieren API Key fija (identifica petición desde paypac.co)
- **Prefijo**: Todos los endpoints públicos usan `/api/public/*`

### Decisiones de negocio
- Solo eventos con `status IN ('APPROVED', 'ACTIVE')` y `event_type = 'PUBLICO'`
- Solo localidades con al menos 1 stage activo (`date_start <= now <= date_end`)
- Validación de códigos de descuento **requiere login** (no pública)
- País por defecto: Colombia (`DEFAULT_COUNTRY_ID = 1`)

---

## Infraestructura

### Variables de entorno

Agregar al archivo `.env`:

```env
# ========================================
# WEB API CONFIGURATION
# ========================================
WEB_API_KEY=paypac-web-secret-2026-xyz123abc456def789
DEFAULT_COUNTRY_ID=1  # Colombia

# Rate limits (requests por minuto)
WEB_RATE_LIMIT_EVENTS=60
WEB_RATE_LIMIT_DETAIL=100
WEB_RATE_LIMIT_LOCALITIES=100
WEB_RATE_LIMIT_CATEGORIES=30
WEB_RATE_LIMIT_CITIES=20
```

### Constantes globales

**Archivo:** `src/config/constants.ts`

```typescript
// AGREGAR al final del archivo:

export const DEFAULT_COUNTRY_ID = parseInt(process.env.DEFAULT_COUNTRY_ID || '1');
export const WEB_API_KEY = process.env.WEB_API_KEY;

// Status permitidos en endpoints públicos
export const PUBLIC_EVENT_STATUSES = ['APPROVED', 'ACTIVE'] as const;
export const PUBLIC_EVENT_TYPE = 'PUBLICO' as const;
```

### Middleware de autenticación web

**Archivo nuevo:** `src/middlewares/authenticatePublicWeb.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { WEB_API_KEY } from '../config/constants';

/**
 * Middleware para validar peticiones desde paypac.co
 * NO crea req.user — solo valida que la petición venga del frontend web
 * 
 * Header esperado:
 *   X-Web-API-Key: {WEB_API_KEY}
 * O alternativamente:
 *   Authorization: Bearer {WEB_API_KEY}
 */
export const authenticatePublicWeb = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey =
    req.headers['x-web-api-key'] ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== WEB_API_KEY) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing web API key'
    });
    return;
  }

  // No crear req.user — la web no tiene usuario autenticado
  next();
};
```

### Rate limiters

**Archivo nuevo:** `src/middlewares/rateLimiters.ts`

```typescript
import rateLimit from 'express-rate-limit';

const RATE_LIMIT_MESSAGE = 'Too many requests from this IP, please try again later.';

// Limiter para listado de eventos públicos
export const publicEventsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: parseInt(process.env.WEB_RATE_LIMIT_EVENTS || '60'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter para detalle de evento
export const publicEventDetailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_DETAIL || '100'),
  message: RATE_LIMIT_MESSAGE,
});

// Limiter para localidades
export const publicLocalitiesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_LOCALITIES || '100'),
  message: RATE_LIMIT_MESSAGE,
});

// Limiter para categorías/subcategorías/subgéneros
export const publicCatalogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_CATEGORIES || '30'),
  message: RATE_LIMIT_MESSAGE,
});

// Limiter para ciudades
export const publicCitiesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_CITIES || '20'),
  message: RATE_LIMIT_MESSAGE,
});
```

### Router principal público

**Archivo nuevo:** `src/routes/public/index.ts`

```typescript
import { Router } from 'express';
import eventsRouter from './events.routes';
import categoriesRouter from './categories.routes';
import subcategoriesRouter from './subcategories.routes';
import subgenresRouter from './subgenres.routes';
import citiesRouter from './cities.routes';

const publicRouter = Router();

publicRouter.use('/events', eventsRouter);
publicRouter.use('/categories', categoriesRouter);
publicRouter.use('/subcategories', subcategoriesRouter);
publicRouter.use('/subgenres', subgenresRouter);
publicRouter.use('/cities', citiesRouter);

export default publicRouter;
```

**Modificar:** `src/index.ts` o `src/app.ts`

```typescript
// AGREGAR después de las rutas existentes:
import publicRouter from './routes/public';

app.use('/api/public', publicRouter);
```

---

## Sprint 1: Eventos Públicos

### 1.1 GET /api/public/events

**Descripción:** Listar eventos públicos con filtros opcionales

**Middleware:**
- `authenticatePublicWeb`
- `publicEventsLimiter`
- `validateRequest(getPublicEventsQuerySchema)`

**Query params (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `search` | string | Busca en name, description, short_description | `?search=rock` |
| `date_from` | string | YYYY-MM-DD — eventos desde esta fecha | `?date_from=2026-06-01` |
| `date_to` | string | YYYY-MM-DD — eventos hasta esta fecha | `?date_to=2026-12-31` |
| `city` | number | ID de ciudad | `?city=1` |
| `category_id` | string | IDs separados por coma | `?category_id=1,2,3` |
| `sort_by` | string | Ordenamiento (ver tabla) | `?sort_by=price_asc` |
| `page` | number | Página (default: 1) | `?page=2` |
| `limit` | number | Items por página (default: 20, max: 100) | `?limit=50` |

**Valores de `sort_by`:**

| Valor | Descripción |
|-------|-------------|
| `date_asc` | Fecha más cercana (DEFAULT) |
| `popularity` | Popularidad (ventas * 0.6 + views * 0.4) |
| `price_asc` | Precio: menor a mayor |
| `price_desc` | Precio: mayor a menor |
| `name_asc` | Nombre A-Z |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/events?search=rock&city=1&sort_by=price_asc&page=1&limit=20" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

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
    },
    {
      "id": 15,
      "name": "Concierto Acústico",
      "image": "https://storage.paypac.co/events/15/image.jpg",
      "short_description": "Una noche íntima con los mejores artistas",
      "date_event": "2026-07-20T19:00:00.000Z",
      "place_address": "Carrera 43A # 1-50, Medellín",
      "description": "Descripción...",
      "cover": "https://storage.paypac.co/events/15/cover.jpg",
      "url_video": "",
      "organizer_id": 8,
      "price_from": {
        "name_locality": "Platea",
        "stage_name": "Preventa 2",
        "date_start": "2026-06-01T00:00:00.000Z",
        "date_end": "2026-07-15T23:59:00.000Z",
        "price_ticket": 120000
      }
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Notas importantes:**
- `price_from` puede ser `null` para eventos gratuitos
- Solo eventos con al menos 1 stage activo (comentario en código: `// TODO: Support free events without stages`)
- Forzar `status: ['APPROVED', 'ACTIVE']` y `event_type: 'PUBLICO'` en el servicio

**Archivo de validación:** `src/validators/public/events.validation.ts`

```typescript
import { z } from 'zod';

export const getPublicEventsQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    city: z.string().transform(Number).optional(),
    category_id: z.string().optional(), // "1,2,3"
    sort_by: z.enum(['date_asc', 'popularity', 'price_asc', 'price_desc', 'name_asc']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).pipe(z.number().max(100)).optional(),
  })
};
```

**Archivo de servicio:** `src/services/event.service.ts`

Agregar método:

```typescript
async getPublicEvents(filters: {
  search?: string;
  date_from?: string;
  date_to?: string;
  city?: number;
  category_id?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}) {
  const now = new Date();
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const skip = (page - 1) * limit;

  // Parsear category_id: "1,2,3" -> [1, 2, 3]
  const categoryIds = filters.category_id
    ? filters.category_id.split(',').map(Number)
    : undefined;

  const where = {
    status: { in: ['APPROVED', 'ACTIVE'] as EVENT_STATUS[] },
    event_type: 'PUBLICO' as TypeEvent,
    
    // Filtro: solo eventos con al menos 1 stage activo
    // TODO: Support free events without stages
    localities: {
      some: {
        stages: {
          some: {
            date_start: { lte: now },
            date_end: { gte: now }
          }
        }
      }
    },

    // Filtros opcionales del usuario
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { short_description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }),

    ...(filters.date_from && {
      date_event: { gte: new Date(filters.date_from) }
    }),

    ...(filters.date_to && {
      date_event: { lte: new Date(filters.date_to) }
    }),

    ...(filters.city && { city: String(filters.city) }),

    ...(categoryIds && {
      category_id: { in: categoryIds }
    })
  };

  // Obtener eventos con price_from
  const events = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      image: true,
      short_description: true,
      date_event: true,
      place_address: true,
      description: true,
      cover: true,
      url_video: true,
      organizer_id: true,

      // Calcular price_from desde stage activo más barato
      localities: {
        select: {
          name_locality: true,
          stages: {
            where: {
              date_start: { lte: now },
              date_end: { gte: now }
            },
            select: {
              stage_name: true,
              date_start: true,
              date_end: true,
              price_ticket: true
            },
            orderBy: { price_ticket: 'asc' },
            take: 1
          }
        },
        take: 1,
        orderBy: {
          stages: {
            _min: { price_ticket: 'asc' }
          }
        }
      },

      // Para calcular popularidad
      _count: {
        select: {
          tickets: {
            where: { status_ticket: { in: ['PAID', 'ACTIVE'] } }
          },
          views: true
        }
      }
    }
  });

  // Post-procesamiento: formar price_from y calcular popularidad
  let eventsFormatted = events.map(event => {
    const locality = event.localities[0];
    const stage = locality?.stages[0];

    return {
      id: event.id,
      name: event.name,
      image: event.image,
      short_description: event.short_description,
      date_event: event.date_event,
      place_address: event.place_address,
      description: event.description,
      cover: event.cover,
      url_video: event.url_video,
      organizer_id: event.organizer_id,
      price_from: stage ? {
        name_locality: locality.name_locality,
        stage_name: stage.stage_name,
        date_start: stage.date_start,
        date_end: stage.date_end,
        price_ticket: stage.price_ticket
      } : null,
      popularityScore: (event._count.tickets * 0.6) + (event._count.views * 0.4)
    };
  });

  // Aplicar ordenamiento
  const sortBy = filters.sort_by || 'date_asc';

  if (sortBy === 'popularity') {
    eventsFormatted.sort((a, b) => {
      if (a.popularityScore !== b.popularityScore) {
        return b.popularityScore - a.popularityScore;
      }
      return new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
    });
  } else if (sortBy === 'price_asc') {
    eventsFormatted.sort((a, b) => {
      const priceA = a.price_from?.price_ticket || Infinity;
      const priceB = b.price_from?.price_ticket || Infinity;
      if (priceA !== priceB) return priceA - priceB;
      return new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
    });
  } else if (sortBy === 'price_desc') {
    eventsFormatted.sort((a, b) => {
      const priceA = a.price_from?.price_ticket || 0;
      const priceB = b.price_from?.price_ticket || 0;
      if (priceA !== priceB) return priceB - priceA;
      return new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
    });
  } else if (sortBy === 'name_asc') {
    eventsFormatted.sort((a, b) => a.name.localeCompare(b.name));
  } else { // date_asc (default)
    eventsFormatted.sort((a, b) => 
      new Date(a.date_event).getTime() - new Date(b.date_event).getTime()
    );
  }

  // Remover popularityScore antes de retornar
  const eventsClean = eventsFormatted.map(({ popularityScore, ...event }) => event);

  // Contar total
  const total = await prisma.event.count({ where });

  return {
    data: eventsClean,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
```

**Archivo de controller:** `src/controllers/public/events.controller.ts`

```typescript
import { Request, Response } from 'express';
import { EventService } from '../../services/event.service';

const eventService = new EventService();

export const getPublicEvents = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await eventService.getPublicEvents(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicEvents:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch events'
    });
  }
};
```

**Archivo de rutas:** `src/routes/public/events.routes.ts`

```typescript
import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicEventsLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validateRequest';
import { getPublicEventsQuerySchema } from '../../validators/public/events.validation';
import { getPublicEvents } from '../../controllers/public/events.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicEventsLimiter,
  validateRequest(getPublicEventsQuerySchema),
  getPublicEvents
);

export default router;
```

---

### 1.2 GET /api/public/events/:id

**Descripción:** Obtener detalle de un evento público

**Middleware:**
- `authenticatePublicWeb`
- `publicEventDetailLimiter`
- `validateRequest(getPublicEventByIdParamsSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del evento |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/events/12" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

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

**Respuesta de error (404):**

```json
{
  "error": "Not Found",
  "message": "Event not found"
}
```

**Notas:**
- Retorna 404 si el evento es `PRIVADO`, `CANCELED`, `CREATED`, o cualquier status que no sea `APPROVED`/`ACTIVE`
- No revelar que el evento existe — siempre retornar 404 genérico

**Validación:** `src/validators/public/events.validation.ts`

```typescript
export const getPublicEventByIdParamsSchema = {
  params: z.object({
    id: z.string().transform(Number)
  })
};
```

**Servicio:** `src/services/event.service.ts`

```typescript
async getPublicEventById(id: number) {
  const now = new Date();

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      short_description: true,
      date_event: true,
      place_address: true,
      description: true,
      cover: true,
      url_video: true,
      organizer_id: true,
      status: true,
      event_type: true,

      localities: {
        select: {
          name_locality: true,
          stages: {
            where: {
              date_start: { lte: now },
              date_end: { gte: now }
            },
            select: {
              stage_name: true,
              date_start: true,
              date_end: true,
              price_ticket: true
            },
            orderBy: { price_ticket: 'asc' },
            take: 1
          }
        },
        take: 1,
        orderBy: {
          stages: {
            _min: { price_ticket: 'asc' }
          }
        }
      }
    }
  });

  // Validación estricta: no revelar eventos privados/inactivos
  if (!event ||
      !['APPROVED', 'ACTIVE'].includes(event.status) ||
      event.event_type !== 'PUBLICO') {
    throw new Error('Event not found');
  }

  const locality = event.localities[0];
  const stage = locality?.stages[0];

  return {
    data: {
      id: event.id,
      name: event.name,
      image: event.image,
      short_description: event.short_description,
      date_event: event.date_event,
      place_address: event.place_address,
      description: event.description,
      cover: event.cover,
      url_video: event.url_video,
      organizer_id: event.organizer_id,
      price_from: stage ? {
        name_locality: locality.name_locality,
        stage_name: stage.stage_name,
        date_start: stage.date_start,
        date_end: stage.date_end,
        price_ticket: stage.price_ticket
      } : null
    }
  };
}
```

**Controller:** `src/controllers/public/events.controller.ts`

```typescript
export const getPublicEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await eventService.getPublicEventById(Number(id));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicEventById:', error);
    res.status(404).json({
      error: 'Not Found',
      message: 'Event not found'
    });
  }
};
```

**Routes:** `src/routes/public/events.routes.ts`

```typescript
import { getPublicEventById } from '../../controllers/public/events.controller';
import { getPublicEventByIdParamsSchema } from '../../validators/public/events.validation';
import { publicEventDetailLimiter } from '../../middlewares/rateLimiters';

router.get(
  '/:id',
  authenticatePublicWeb,
  publicEventDetailLimiter,
  validateRequest(getPublicEventByIdParamsSchema),
  getPublicEventById
);
```

---

### 1.3 GET /api/public/events/:eventId/localities

**Descripción:** Obtener localidades y etapas activas de un evento

**Middleware:**
- `authenticatePublicWeb`
- `publicLocalitiesLimiter`
- `validateRequest(getPublicLocalitiesParamsSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `eventId` | number | ID del evento |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/events/12/localities" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

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
    },
    {
      "id": 4,
      "event_id": 12,
      "name_locality": "General",
      "bkg_color": "#2E2E2E",
      "title_color": "#FFFFFF",
      "text_color": "#CCCCCC",
      "title_color_location": "#00FFFB",
      "createdAt": "2026-01-10T15:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z",
      "stages": [
        {
          "id": 9,
          "locality_id": 4,
          "stage_name": "Preventa 2",
          "date_start": "2026-04-01T00:00:00.000Z",
          "date_end": "2026-05-31T23:59:00.000Z",
          "price_ticket": 85000,
          "createdAt": "2026-01-10T15:00:00.000Z",
          "updatedAt": "2026-02-01T10:00:00.000Z"
        }
      ]
    }
  ],
  "total": 2
}
```

**Notas importantes:**
- Solo localidades con al menos 1 stage activo
- Cada localidad tiene **exactamente 1 stage** en el array (el activo en este momento)
- Si el evento no existe o es privado → 404

**Validación:** `src/validators/public/events.validation.ts`

```typescript
export const getPublicLocalitiesParamsSchema = {
  params: z.object({
    eventId: z.string().transform(Number)
  })
};
```

**Servicio:** `src/services/locality.service.ts`

```typescript
async getPublicLocalitiesByEvent(eventId: number) {
  const now = new Date();

  // 1. Validar que el evento sea público
  await eventService.getPublicEventById(eventId); // Lanza error si no es público

  // 2. Obtener solo localidades con etapa activa
  const localities = await prisma.eventLocalities.findMany({
    where: {
      event_id: eventId,
      stages: {
        some: {
          date_start: { lte: now },
          date_end: { gte: now }
        }
      }
    },
    include: {
      stages: {
        where: {
          date_start: { lte: now },
          date_end: { gte: now }
        },
        orderBy: { price_ticket: 'asc' },
        take: 1
      }
    },
    orderBy: { name_locality: 'asc' }
  });

  // Filtrar localidades sin stages (por seguridad)
  const validLocalities = localities.filter(loc => loc.stages.length > 0);

  return {
    data: validLocalities,
    total: validLocalities.length
  };
}
```

**Controller:** `src/controllers/public/localities.controller.ts`

```typescript
import { Request, Response } from 'express';
import { LocalityService } from '../../services/locality.service';

const localityService = new LocalityService();

export const getPublicLocalities = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const result = await localityService.getPublicLocalitiesByEvent(Number(eventId));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicLocalities:', error);
    res.status(404).json({
      error: 'Not Found',
      message: 'Event not found or no active localities'
    });
  }
};
```

**Routes:** `src/routes/public/events.routes.ts`

```typescript
import { getPublicLocalities } from '../../controllers/public/localities.controller';
import { getPublicLocalitiesParamsSchema } from '../../validators/public/events.validation';

router.get(
  '/:eventId/localities',
  authenticatePublicWeb,
  publicLocalitiesLimiter,
  validateRequest(getPublicLocalitiesParamsSchema),
  getPublicLocalities
);
```

---

## Sprint 2: Filtros de Búsqueda

### 2.1 GET /api/public/categories

**Descripción:** Listar categorías con eventos públicos activos

**Middleware:**
- `authenticatePublicWeb`
- `publicCatalogLimiter`
- `validateRequest(getPublicCategoriesQuerySchema)`

**Query params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Opcional — buscar por nombre |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/categories?search=con" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

```json
{
  "data": [
    {
      "id": 1,
      "category_name": "Conciertos",
      "category_icon": "https://storage.paypac.co/icons/conciertos.svg",
      "country_id": 1,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "category_name": "Deportes",
      "category_icon": "https://storage.paypac.co/icons/deportes.svg",
      "country_id": 1,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Validación:** `src/validators/public/categories.validation.ts`

```typescript
import { z } from 'zod';

export const getPublicCategoriesQuerySchema = {
  query: z.object({
    search: z.string().optional()
  })
};
```

**Servicio:** `src/services/category.service.ts`

```typescript
async getPublicCategories(filters: { search?: string }) {
  const categories = await prisma.category.findMany({
    where: {
      // Solo categorías con eventos públicos activos
      events: {
        some: {
          status: { in: ['APPROVED', 'ACTIVE'] },
          event_type: 'PUBLICO'
        }
      },
      ...(filters.search && {
        category_name: {
          contains: filters.search,
          mode: 'insensitive'
        }
      })
    },
    select: {
      id: true,
      category_name: true,
      category_icon: true,
      country_id: true,
      createdAt: true
    },
    orderBy: { category_name: 'asc' }
  });

  return {
    data: categories,
    total: categories.length
  };
}
```

**Controller:** `src/controllers/public/categories.controller.ts`

```typescript
import { Request, Response } from 'express';
import { CategoryService } from '../../services/category.service';

const categoryService = new CategoryService();

export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await categoryService.getPublicCategories(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicCategories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
};
```

**Routes:** `src/routes/public/categories.routes.ts`

```typescript
import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validateRequest';
import { getPublicCategoriesQuerySchema } from '../../validators/public/categories.validation';
import { getPublicCategories } from '../../controllers/public/categories.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicCategoriesQuerySchema),
  getPublicCategories
);

export default router;
```

---

### 2.2 GET /api/public/subcategories/by-category/:categoryId

**Descripción:** Listar subcategorías de una categoría

**Middleware:**
- `authenticatePublicWeb`
- `publicCatalogLimiter`
- `validateRequest(getPublicSubcategoriesParamsSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoryId` | number | ID de la categoría |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/subcategories/by-category/1" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

```json
{
  "data": [
    {
      "id": 5,
      "category_id": 1,
      "subcategory_name": "Rock",
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": 6,
      "category_id": 1,
      "subcategory_name": "Pop",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Validación:** `src/validators/public/subcategories.validation.ts`

```typescript
import { z } from 'zod';

export const getPublicSubcategoriesParamsSchema = {
  params: z.object({
    categoryId: z.string().transform(Number)
  })
};
```

**Servicio:** `src/services/subcategory.service.ts`

```typescript
async getPublicSubcategories(categoryId: number) {
  const subcategories = await prisma.subCategory.findMany({
    where: {
      category_id: categoryId,
      events: {
        some: {
          status: { in: ['APPROVED', 'ACTIVE'] },
          event_type: 'PUBLICO'
        }
      }
    },
    select: {
      id: true,
      category_id: true,
      subcategory_name: true,
      createdAt: true
    },
    orderBy: { subcategory_name: 'asc' }
  });

  return {
    data: subcategories,
    total: subcategories.length
  };
}
```

**Controller:** `src/controllers/public/subcategories.controller.ts`

```typescript
import { Request, Response } from 'express';
import { SubcategoryService } from '../../services/subcategory.service';

const subcategoryService = new SubcategoryService();

export const getPublicSubcategories = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const result = await subcategoryService.getPublicSubcategories(Number(categoryId));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicSubcategories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch subcategories'
    });
  }
};
```

**Routes:** `src/routes/public/subcategories.routes.ts`

```typescript
import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validateRequest';
import { getPublicSubcategoriesParamsSchema } from '../../validators/public/subcategories.validation';
import { getPublicSubcategories } from '../../controllers/public/subcategories.controller';

const router = Router();

router.get(
  '/by-category/:categoryId',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicSubcategoriesParamsSchema),
  getPublicSubcategories
);

export default router;
```

---

### 2.3 GET /api/public/subgenres

**Descripción:** Listar subgéneros con filtros opcionales

**Middleware:**
- `authenticatePublicWeb`
- `publicCatalogLimiter`
- `validateRequest(getPublicSubgenresQuerySchema)`

**Query params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Opcional — buscar por nombre |
| `subcategory_id` | number | Opcional — filtrar por subcategoría |
| `category_id` | number | Opcional — filtrar por categoría |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/subgenres?subcategory_id=5" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

```json
{
  "data": [
    {
      "id": 10,
      "subcategory_id": 5,
      "subcategory_name": "Rock Alternativo",
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": 11,
      "subcategory_id": 5,
      "subcategory_name": "Rock Clásico",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Validación:** `src/validators/public/subgenres.validation.ts`

```typescript
import { z } from 'zod';

export const getPublicSubgenresQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    subcategory_id: z.string().transform(Number).optional(),
    category_id: z.string().transform(Number).optional()
  })
};
```

**Servicio:** `src/services/subgenre.service.ts`

```typescript
async getPublicSubgenres(filters: {
  search?: string;
  subcategory_id?: number;
  category_id?: number;
}) {
  const where: any = {
    events: {
      some: {
        status: { in: ['APPROVED', 'ACTIVE'] },
        event_type: 'PUBLICO'
      }
    },
    ...(filters.search && {
      subcategory_name: {
        contains: filters.search,
        mode: 'insensitive'
      }
    }),
    ...(filters.subcategory_id && {
      subcategory_id: filters.subcategory_id
    })
  };

  // Si filtran por category_id, hacerlo a través de subcategory
  if (filters.category_id) {
    where.subcategory = {
      category_id: filters.category_id
    };
  }

  const subgenres = await prisma.subgenre.findMany({
    where,
    select: {
      id: true,
      subcategory_id: true,
      subcategory_name: true,
      createdAt: true
    },
    orderBy: { subcategory_name: 'asc' }
  });

  return {
    data: subgenres,
    total: subgenres.length
  };
}
```

**Controller:** `src/controllers/public/subgenres.controller.ts`

```typescript
import { Request, Response } from 'express';
import { SubgenreService } from '../../services/subgenre.service';

const subgenreService = new SubgenreService();

export const getPublicSubgenres = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await subgenreService.getPublicSubgenres(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicSubgenres:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch subgenres'
    });
  }
};
```

**Routes:** `src/routes/public/subgenres.routes.ts`

```typescript
import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validateRequest';
import { getPublicSubgenresQuerySchema } from '../../validators/public/subgenres.validation';
import { getPublicSubgenres } from '../../controllers/public/subgenres.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicSubgenresQuerySchema),
  getPublicSubgenres
);

export default router;
```

---

### 2.4 GET /api/public/cities

**Descripción:** Listar ciudades con eventos públicos activos

**Middleware:**
- `authenticatePublicWeb`
- `publicCitiesLimiter`
- `validateRequest(getPublicCitiesQuerySchema)`

**Query params:**

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `country_id` | number | Opcional — filtrar por país | `DEFAULT_COUNTRY_ID` (1) |

**Ejemplo de request:**

```bash
curl -X GET "https://paypac-backend.railway.app/api/public/cities" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789"
```

**Respuesta exitosa (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name_city": "Medellín",
      "country_id": 1
    },
    {
      "id": 2,
      "name_city": "Bogotá",
      "country_id": 1
    },
    {
      "id": 3,
      "name_city": "Cali",
      "country_id": 1
    }
  ],
  "total": 3
}
```

**Validación:** `src/validators/public/cities.validation.ts`

```typescript
import { z } from 'zod';
import { DEFAULT_COUNTRY_ID } from '../../config/constants';

export const getPublicCitiesQuerySchema = {
  query: z.object({
    country_id: z.string().transform(Number).optional().default(String(DEFAULT_COUNTRY_ID))
  })
};
```

**Servicio:** `src/services/city.service.ts` (NUEVO ARCHIVO)

```typescript
import { PrismaClient } from '@prisma/client';
import { DEFAULT_COUNTRY_ID } from '../config/constants';

const prisma = new PrismaClient();

export class CityService {
  async getPublicCities(countryId?: number) {
    const targetCountryId = countryId || DEFAULT_COUNTRY_ID;

    const cities = await prisma.cities.findMany({
      where: {
        country_id: targetCountryId,
        // Solo ciudades con eventos públicos activos
        // Nota: esto requiere que Event tenga campo city con ID, no String
        // Si Event.city es String, usar query diferente
      },
      select: {
        id: true,
        name_city: true,
        country_id: true
      },
      orderBy: { name_city: 'asc' }
    });

    return {
      data: cities,
      total: cities.length
    };
  }
}
```

**IMPORTANTE:** El modelo `Event` actual tiene `city` como `String`, no como relación a `Cities`. Hay dos opciones:

**Opción A:** Obtener ciudades únicas desde Event.city (String) y hacer join manual

**Opción B:** Cambiar el schema para que Event.city sea relación a Cities (migración requerida)

**Recomendación:** Usar Opción A por ahora para no romper nada:

```typescript
async getPublicCities(countryId?: number) {
  const targetCountryId = countryId || DEFAULT_COUNTRY_ID;

  // Obtener ciudades únicas de eventos públicos activos
  const events = await prisma.event.findMany({
    where: {
      status: { in: ['APPROVED', 'ACTIVE'] },
      event_type: 'PUBLICO',
      city: { not: '' }
    },
    select: {
      city: true
    },
    distinct: ['city']
  });

  // Obtener nombres de ciudades únicos
  const cityNames = events.map(e => e.city);

  // Buscar en tabla Cities
  const cities = await prisma.cities.findMany({
    where: {
      country_id: targetCountryId,
      name_city: { in: cityNames }
    },
    select: {
      id: true,
      name_city: true,
      country_id: true
    },
    orderBy: { name_city: 'asc' }
  });

  return {
    data: cities,
    total: cities.length
  };
}
```

**Controller:** `src/controllers/public/cities.controller.ts`

```typescript
import { Request, Response } from 'express';
import { CityService } from '../../services/city.service';

const cityService = new CityService();

export const getPublicCities = async (req: Request, res: Response) => {
  try {
    const { country_id } = req.query;
    const result = await cityService.getPublicCities(country_id ? Number(country_id) : undefined);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicCities:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch cities'
    });
  }
};
```

**Routes:** `src/routes/public/cities.routes.ts`

```typescript
import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCitiesLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validateRequest';
import { getPublicCitiesQuerySchema } from '../../validators/public/cities.validation';
import { getPublicCities } from '../../controllers/public/cities.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCitiesLimiter,
  validateRequest(getPublicCitiesQuerySchema),
  getPublicCities
);

export default router;
```

---

## Sprint 3: Event Tracking

### 3.1 POST /api/public/events/:id/view

**Descripción:** Crear un registro de visualización al entrar al detalle del evento

**Middleware:**
- `authenticatePublicWeb`
- Rate limiter específico (prevenir spam)
- `validateRequest(createEventViewSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del evento |

**Body:**

```json
{
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": null,
  "session_channel": "WEB",
  "country_id": 1,
  "city_id": 5
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `session_token` | string | Sí | UUID generado en frontend |
| `user_id` | number | No | Si está logueado |
| `session_channel` | enum | Sí | "WEB" o "APP" |
| `country_id` | number | No | De geolocalización |
| `city_id` | number | No | De geolocalización |

**Ejemplo de request:**

```bash
curl -X POST "https://paypac-backend.railway.app/api/public/events/12/view" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789" \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "550e8400-e29b-41d4-a716-446655440000",
    "session_channel": "WEB",
    "country_id": 1,
    "city_id": 5
  }'
```

**Respuesta exitosa (201):**

```json
{
  "id": 456,
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "message": "View created"
}
```

**Respuesta si ya existe (200):**

```json
{
  "id": 456,
  "session_token": "550e8400-e29b-41d4-a716-446655440000",
  "message": "View already exists"
}
```

**Notas:**
- Idempotente: si ya existe `event_id + session_token`, retorna el existente
- `session_ip` se detecta automáticamente en backend desde `req.ip`
- `user_agent`, `referrer`, `device_type` se detectan desde headers

**Validación:** `src/validators/public/eventViews.validation.ts`

```typescript
import { z } from 'zod';

export const createEventViewSchema = {
  params: z.object({
    id: z.string().transform(Number)
  }),
  body: z.object({
    session_token: z.string().uuid(),
    user_id: z.number().optional().nullable(),
    session_channel: z.enum(['WEB', 'APP']),
    country_id: z.number().optional().nullable(),
    city_id: z.number().optional().nullable()
  })
};
```

**Servicio:** `src/services/eventView.service.ts` (NUEVO ARCHIVO)

```typescript
import { PrismaClient, SalesChannel, DeviceType } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export class EventViewService {
  detectDeviceType(userAgent: string): DeviceType {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone/i.test(ua)) return 'MOBILE';
    if (/tablet|ipad/i.test(ua)) return 'TABLET';
    return 'DESKTOP';
  }

  async createView(
    eventId: number,
    data: {
      session_token: string;
      user_id?: number | null;
      session_channel: SalesChannel;
      country_id?: number | null;
      city_id?: number | null;
    },
    req: Request
  ) {
    // Detectar IP, user_agent, referrer desde request
    const sessionIp = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;
    const deviceType = this.detectDeviceType(userAgent);

    // Buscar si ya existe (idempotente)
    const existing = await prisma.eventView.findUnique({
      where: {
        event_id_session_token: {
          event_id: eventId,
          session_token: data.session_token
        }
      }
    });

    if (existing) {
      return {
        id: existing.id,
        session_token: existing.session_token,
        message: 'View already exists'
      };
    }

    // Crear nuevo registro
    const view = await prisma.eventView.create({
      data: {
        event_id: eventId,
        user_id: data.user_id || null,
        session_token: data.session_token,
        session_duration: 0,
        session_ip: sessionIp,
        session_channel: data.session_channel,
        session_conversion: false,
        country_id: data.country_id || null,
        city_id: data.city_id || null,
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceType
      }
    });

    return {
      id: view.id,
      session_token: view.session_token,
      message: 'View created'
    };
  }
}
```

**Controller:** `src/controllers/public/eventViews.controller.ts`

```typescript
import { Request, Response } from 'express';
import { EventViewService } from '../../services/eventView.service';

const eventViewService = new EventViewService();

export const createEventView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const result = await eventViewService.createView(Number(id), data, req);
    
    const statusCode = result.message === 'View created' ? 201 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in createEventView:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create view'
    });
  }
};
```

**Routes:** Agregar a `src/routes/public/events.routes.ts`

```typescript
import { createEventView } from '../../controllers/public/eventViews.controller';
import { createEventViewSchema } from '../../validators/public/eventViews.validation';

router.post(
  '/:id/view',
  authenticatePublicWeb,
  rateLimit({ windowMs: 60000, max: 10 }), // Max 10 por minuto
  validateRequest(createEventViewSchema),
  createEventView
);
```

---

### 3.2 PATCH /api/public/events/:id/view/:sessionToken

**Descripción:** Actualizar duración acumulada de una sesión

**Middleware:**
- `authenticatePublicWeb`
- Rate limiter
- `validateRequest(updateEventViewSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del evento |
| `sessionToken` | string | UUID de la sesión |

**Body:**

```json
{
  "duration": 145
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `duration` | number | Sí | Segundos a agregar |

**Ejemplo de request:**

```bash
curl -X PATCH "https://paypac-backend.railway.app/api/public/events/12/view/550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Web-API-Key: paypac-web-secret-2026-xyz123abc456def789" \
  -H "Content-Type: application/json" \
  -d '{"duration": 145}'
```

**Respuesta exitosa (200):**

```json
{
  "message": "Duration updated",
  "total_duration": 145
}
```

**Validación:** `src/validators/public/eventViews.validation.ts`

```typescript
export const updateEventViewSchema = {
  params: z.object({
    id: z.string().transform(Number),
    sessionToken: z.string().uuid()
  }),
  body: z.object({
    duration: z.number().int().positive()
  })
};
```

**Servicio:** `src/services/eventView.service.ts`

```typescript
async updateDuration(eventId: number, sessionToken: string, duration: number) {
  const updated = await prisma.eventView.updateMany({
    where: {
      event_id: eventId,
      session_token: sessionToken
    },
    data: {
      session_duration: { increment: duration }
    }
  });

  if (updated.count === 0) {
    throw new Error('View not found');
  }

  // Obtener duración total
  const view = await prisma.eventView.findUnique({
    where: {
      event_id_session_token: {
        event_id: eventId,
        session_token: sessionToken
      }
    },
    select: { session_duration: true }
  });

  return {
    message: 'Duration updated',
    total_duration: view?.session_duration || 0
  };
}
```

**Controller:** `src/controllers/public/eventViews.controller.ts`

```typescript
export const updateEventViewDuration = async (req: Request, res: Response) => {
  try {
    const { id, sessionToken } = req.params;
    const { duration } = req.body;
    
    const result = await eventViewService.updateDuration(Number(id), sessionToken, duration);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateEventViewDuration:', error);
    res.status(404).json({
      error: 'Not Found',
      message: 'View not found'
    });
  }
};
```

**Routes:** Agregar a `src/routes/public/events.routes.ts`

```typescript
import { updateEventViewDuration } from '../../controllers/public/eventViews.controller';
import { updateEventViewSchema } from '../../validators/public/eventViews.validation';

router.patch(
  '/:id/view/:sessionToken',
  authenticatePublicWeb,
  rateLimit({ windowMs: 60000, max: 20 }),
  validateRequest(updateEventViewSchema),
  updateEventViewDuration
);
```

---

### 3.3 POST /api/events/:id/view/conversion (REQUIERE AUTH)

**Descripción:** Marcar conversión después de crear factura

**Middleware:**
- `authenticate` (Firebase token, NO web API key)
- `authorizeRoles('CUSTOMER')`
- `validateRequest(markConversionSchema)`

**Params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del evento |

**Body:**

```json
{
  "session_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Ejemplo de request:**

```bash
curl -X POST "https://paypac-backend.railway.app/api/events/12/view/conversion" \
  -H "Authorization: Bearer {firebase-id-token}" \
  -H "Content-Type: application/json" \
  -d '{"session_token": "550e8400-e29b-41d4-a716-446655440000"}'
```

**Respuesta exitosa (200):**

```json
{
  "message": "Conversion marked"
}
```

**Validación:** `src/validators/eventViews.validation.ts`

```typescript
export const markConversionSchema = {
  params: z.object({
    id: z.string().transform(Number)
  }),
  body: z.object({
    session_token: z.string().uuid()
  })
};
```

**Servicio:** `src/services/eventView.service.ts`

```typescript
async markConversion(eventId: number, sessionToken: string) {
  const updated = await prisma.eventView.updateMany({
    where: {
      event_id: eventId,
      session_token: sessionToken
    },
    data: {
      session_conversion: true
    }
  });

  if (updated.count === 0) {
    // No lanzar error — puede que no exista view si compró sin navegar
    console.warn(`No view found for conversion: event=${eventId}, token=${sessionToken}`);
  }

  return {
    message: 'Conversion marked'
  };
}
```

**Controller:** `src/controllers/eventViews.controller.ts` (NO público)

```typescript
export const markEventViewConversion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { session_token } = req.body;
    
    const result = await eventViewService.markConversion(Number(id), session_token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in markEventViewConversion:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark conversion'
    });
  }
};
```

**Routes:** `src/routes/events.routes.ts` (NO `/public`)

```typescript
import { markEventViewConversion } from '../controllers/eventViews.controller';
import { markConversionSchema } from '../validators/eventViews.validation';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';

router.post(
  '/:id/view/conversion',
  authenticate,
  authorizeRoles('CUSTOMER'),
  validateRequest(markConversionSchema),
  markEventViewConversion
);
```

---

## Endpoints sin cambios

Estos endpoints **se usan después del login** en la web — no requieren duplicado público:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| /api/auth/register | POST | Crear cuenta |
| /api/auth/login | POST | Iniciar sesión |
| /api/auth/me | GET | Obtener perfil del usuario |
| /api/payment-cards | GET | Listar tarjetas del usuario |
| /api/payment-cards | POST | Guardar nueva tarjeta |
| /api/invoices | POST | Crear factura (comprar tickets) |
| /api/tickets/my-tickets | GET | Historial de tickets |
| /api/discounts/validate/:code?event_id=X | GET | Validar código de descuento |

**Todos requieren autenticación Firebase — no cambian.**

---

## Checklist de Implementación

### Sprint 1: Eventos Públicos (3 días)
- [ ] Infraestructura: middleware, rate limiters, constantes
- [ ] GET /api/public/events — listado con filtros y paginación
- [ ] GET /api/public/events/:id — detalle de evento
- [ ] GET /api/public/events/:eventId/localities — localidades con stages activos
- [ ] Testing: validar filtros, ordenamiento, eventos privados no aparecen

### Sprint 2: Filtros de Búsqueda (2 días)
- [ ] GET /api/public/categories
- [ ] GET /api/public/subcategories/by-category/:categoryId
- [ ] GET /api/public/subgenres
- [ ] GET /api/public/cities
- [ ] Testing: validar solo categorías con eventos activos

### Sprint 3: Event Tracking (2 días)
- [ ] POST /api/public/events/:id/view — crear view
- [ ] PATCH /api/public/events/:id/view/:sessionToken — actualizar duración
- [ ] POST /api/events/:id/view/conversion — marcar conversión (requiere auth)
- [ ] Testing: idempotencia, acumulación de duración, conversión correcta

---

## Testing de Seguridad

### Verificar que endpoints públicos NO exponen:
- [ ] Eventos con `status != APPROVED/ACTIVE`
- [ ] Eventos con `event_type = PRIVADO`
- [ ] Localidades sin stage activo
- [ ] Emails, teléfonos, datos sensibles de usuarios
- [ ] Staff IDs, company_id privados

### Verificar rate limiting:
- [ ] Exceder límite → 429 Too Many Requests
- [ ] Límites diferenciados funcionan por endpoint

### Verificar API key:
- [ ] Petición sin API key → 401 Unauthorized
- [ ] API key inválida → 401 Unauthorized
- [ ] API key válida → 200 OK

---

## Notas Finales

- **Todos los endpoints públicos usan prefijo `/api/public`**
- **Middleware obligatorio:** `authenticatePublicWeb` + rate limiter específico
- **Respuestas siempre envueltas:** `{ data, total, ... }`
- **Eventos sin stages activos:** Comentario `// TODO: Support free events without stages`
- **Popularidad:** `(tickets * 0.6 + views * 0.4)`, fallback a `date_asc`
- **Cities:** Ajustar query según si Event.city es String o relación

---

**Generado:** 2026-05-07  
**Versión:** 1.0  
**Proyecto:** PayPac Web — Endpoints Públicos
