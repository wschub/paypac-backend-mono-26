# Backend Reference — PayPac Monolito

Documento de referencia para replicar esta arquitectura en un nuevo proyecto.

---

## 1. Estructura de Carpetas

```
src/
├── index.ts                        ← Entry point: Express app, Socket.IO, rutas, cron jobs
├── app-sidebar.ts                  ← (Archivo auxiliar, ignorar en replica)
│
├── config/
│   ├── constants.ts                ← Constantes globales (DEFAULT_COUNTRY_ID, WEB_API_KEY)
│   ├── brevo.ts                    ← Configuración SDK de Brevo (emails transaccionales)
│   ├── db.ts                       ← Instancia única de PrismaClient (alias de prisma/client)
│   ├── firebase.ts                 ← Inicialización Firebase Admin SDK
│   └── onurix.ts                   ← Configuración OTP/SMS (Onurix)
│
├── prisma/
│   └── client.ts                   ← Instancia canónica de PrismaClient + namespace Prisma
│
├── middlewares/
│   ├── auth.middleware.ts           ← authenticate: verifica Firebase ID token → inyecta req.user
│   ├── role.middleware.ts           ← authorizeRoles(...roles): verifica req.user.role
│   ├── validate.middleware.ts       ← validateRequest(zodSchema): valida body/params/query
│   ├── authenticatePublicWeb.ts     ← Valida X-Web-API-Key (endpoints públicos sin login)
│   └── rateLimiters.ts             ← Rate limiters por endpoint (express-rate-limit)
│
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── company.controller.ts
│   ├── event.controller.ts
│   ├── ...
│   └── public/                     ← Controllers para endpoints sin autenticación Firebase
│       ├── events.controller.ts
│       ├── categories.controller.ts
│       └── ...
│
├── services/
│   ├── auth.service.ts             ← Lógica de registro: Firebase + PostgreSQL + email
│   ├── company.service.ts
│   ├── event.service.ts
│   ├── brevo.service.ts            ← Envío de emails con Brevo SDK
│   ├── city.service.ts
│   ├── eventView.service.ts
│   └── ...
│
├── repositories/
│   ├── user.repository.ts          ← Queries Prisma para User
│   ├── company.repository.ts
│   ├── event.repository.ts
│   └── ...
│
├── routes/
│   ├── auth.routes.ts
│   ├── company.routes.ts
│   ├── event.routes.ts
│   ├── ...
│   └── public/                     ← Rutas públicas (X-Web-API-Key, sin Firebase)
│       ├── index.ts
│       ├── events.routes.ts
│       └── ...
│
├── validators/
│   ├── company.validation.ts       ← Zod schemas: z.object({ body, params, query })
│   ├── event.validation.ts
│   ├── ...
│   └── public/
│       └── events.validation.ts
│
├── jobs/
│   ├── email-queue-processor.ts    ← CRON: procesa cola de emails cada 5 min
│   ├── event-finalizer.ts          ← CRON: finaliza eventos terminados
│   └── ticket-transfer-expiry.ts   ← CRON: expira transferencias de tickets en 48h
│
├── sockets/
│   ├── ticket.socket.ts            ← Socket.IO: eventos de tickets en tiempo real
│   └── notification.socket.ts      ← Socket.IO: notificaciones push
│
├── templates/
│   └── email-templates.ts          ← Plantillas HTML para emails
│
├── types/
│   └── express.d.ts                ← Augmentación de Express: req.user → User (Prisma)
│
├── utils/
│   ├── utils.ts
│   ├── ticket.utils.ts
│   └── wompi.utils.ts
│
└── seeds/
    └── seed_colombia.ts            ← Seed de países, estados, ciudades de Colombia
```

**Convención de nombres:** `entidad.controller.ts` / `entidad.service.ts` / `entidad.repository.ts` / `entidad.routes.ts` / `entidad.validation.ts` — todos en snake_case o kebab-case.

**Patrón de capas:**
```
Route → Middleware → Controller → Service → Repository → Prisma → PostgreSQL
```

---

## 2. package.json y tsconfig.json

### package.json

```json
{
  "name": "paypac-backend-mono-26",
  "version": "1.0.0",
  "type": "commonjs",
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node build/index.js",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1003.0",
    "@getbrevo/brevo": "^3.0.1",
    "@prisma/client": "^6.19.2",
    "axios": "^1.13.2",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.1",
    "firebase-admin": "^10.3.0",
    "jsonwebtoken": "^9.0.3",
    "luxon": "^3.7.2",
    "multer": "^2.1.1",
    "node-cron": "^4.2.1",
    "otplib": "^13.4.0",
    "socket.io": "^4.8.3",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.0.9",
    "@types/node-cron": "^3.0.11",
    "prisma": "^6.12.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

**Comandos clave:**
- `npm run dev` — desarrollo con hot reload (tsx watch)
- `npx prisma migrate dev` — aplicar migraciones
- `npx prisma generate` — regenerar cliente Prisma
- `npx prisma studio` — GUI de base de datos

### tsconfig.json (claves relevantes)

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./build",
    "moduleResolution": "node10",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "exclude": ["node_modules"]
}
```

> `typeRoots` incluye `./src/types` para que `express.d.ts` extienda `req.user`.

---

## 3. CRUD Completo de Company

### Flujo completo: `Route → Controller → Service → Repository → Prisma`

### 3.1 Validator — `src/validators/company.validation.ts`

```typescript
import { z } from 'zod';

const locationFields = {
  country_id: z.number().int().positive().optional(),
  state_id:   z.number().int().positive().optional(),
  city_id:    z.number().int().positive().optional(),
};

// CREATE
export const createCompanySchema = z.object({
  body: z.object({
    company_name:        z.string().min(2),
    company_description: z.string().optional(),
    company_logo:        z.string().url().optional().or(z.literal('')),
    company_cover:       z.string().url().optional().or(z.literal('')),
    company_phone_number:z.string().optional(),
    company_email:       z.string().email().optional(),
    type_identification: z.string().optional(),
    num_identification:  z.string().optional(),
    website:             z.string().url().optional().or(z.literal('')),
    address:             z.string().optional(),
    company_presentation:z.string().optional(),
    ...locationFields,
  }),
});

// UPDATE
export const updateCompanySchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body:   z.object({ /* mismos campos opcionales */ ...locationFields }).refine(
    (d) => Object.keys(d).length > 0,
    { message: 'Debes enviar al menos un campo' }
  ),
});

// GET BY ID / DELETE
export const getCompanyByIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
});

// PATCH STATUS
export const updateCompanyStatusSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body:   z.object({ status: z.number().int().min(0).max(2) }),
});

// GET LIST (query params)
export const getCompaniesQuerySchema = z.object({
  query: z.object({
    search:     z.string().optional(),
    country_id: z.string().regex(/^\d+$/).optional(),
    state_id:   z.string().regex(/^\d+$/).optional(),
    city_id:    z.string().regex(/^\d+$/).optional(),
    status:     z.string().regex(/^\d+$/).optional(),
  }).optional(),
});
```

### 3.2 Repository — `src/repositories/company.repository.ts`

```typescript
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class CompanyRepository {
  private defaultInclude() {
    return {
      country:      { select: { id: true, name_country: true, code: true } },
      state:        { select: { id: true, name_state: true } },
      city:         { select: { id: true, name_city: true } },
      registeredBy: { select: { id: true, name: true, last_name: true, email: true } },
      _count:       { select: { users: true } },
    };
  }

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    return prisma.company.create({ data, include: this.defaultInclude() });
  }

  async findAll(filters?: { search?: string; country_id?: number; state_id?: number; city_id?: number; status?: number }) {
    const where: Prisma.CompanyWhereInput = {};
    if (filters?.search) {
      where.OR = [
        { company_name:        { contains: filters.search, mode: 'insensitive' } },
        { company_email:       { contains: filters.search, mode: 'insensitive' } },
        { company_description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.country_id) where.country_id = filters.country_id;
    if (filters?.state_id)   where.state_id   = filters.state_id;
    if (filters?.city_id)    where.city_id     = filters.city_id;
    if (filters?.status !== undefined) where.status = filters.status;
    return prisma.company.findMany({ where, orderBy: { createdAt: 'desc' }, include: this.defaultInclude() });
  }

  async findById(id: number)                       { return prisma.company.findUnique({ where: { id }, include: this.defaultInclude() }); }
  async findByName(company_name: string)           { return prisma.company.findUnique({ where: { company_name } }); }
  async findByEmail(company_email: string)         { return prisma.company.findUnique({ where: { company_email } }); }
  async findByRegisteredUser(user_id_register: number) { return prisma.company.findMany({ where: { user_id_register }, orderBy: { createdAt: 'desc' }, include: this.defaultInclude() }); }

  async update(id: number, data: Prisma.CompanyUncheckedUpdateInput) {
    return prisma.company.update({ where: { id }, data, include: this.defaultInclude() });
  }

  async updateStatus(id: number, status: number)   { return prisma.company.update({ where: { id }, data: { status } }); }
  async approve(id: number)                        { return prisma.company.update({ where: { id }, data: { status: 1, approved_at: new Date() } }); }
  async delete(id: number)                         { return prisma.company.delete({ where: { id } }); }
  async exists(id: number): Promise<boolean>       { return (await prisma.company.count({ where: { id } })) > 0; }

  async getStats(filters?: { country_id?: number; status?: number }) {
    const where: Prisma.CompanyWhereInput = {};
    if (filters?.country_id) where.country_id = filters.country_id;
    if (filters?.status !== undefined) where.status = filters.status;
    const [total, approved, pending] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.count({ where: { ...where, status: 1 } }),
      prisma.company.count({ where: { ...where, status: 0 } }),
    ]);
    return { total, approved, pending };
  }
}
```

### 3.3 Service — `src/services/company.service.ts`

Lógica de negocio y control de acceso por rol:

| Método | Quién puede | Descripción |
|--------|-------------|-------------|
| `createCompany` | PAYPAC, ORGANIZER | PAYPAC auto-aprueba; ORGANIZER queda pendiente |
| `getCompanies` | Todos autenticados | ORGANIZER solo ve las suyas; otros solo ven aprobadas |
| `getCompanyById` | Todos autenticados | ORGANIZER solo ve las suyas |
| `getMyCompanies` | ORGANIZER | Sus empresas registradas |
| `getMyCompany` | ORGANIZER | Su empresa (via `req.user.company_id`) |
| `updateCompany` | PAYPAC, ORGANIZER | ORGANIZER solo si no está aprobada |
| `approveCompany` | PAYPAC | Pone `status: 1`, `approved_at: now()` |
| `updateStatus` | PAYPAC | `0: pendiente, 1: aprobado, 2: suspendido` |
| `deleteCompany` | PAYPAC | Solo si no tiene usuarios asociados |
| `getCompaniesStats` | PAYPAC | Totales, aprobadas, pendientes |

### 3.4 Controller — `src/controllers/company.controller.ts`

Patrón estándar (todos los métodos):

```typescript
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId   = req.user?.id!;
    const userRole = req.user?.role || '';
    const result   = await companyService.createCompany(req.body, userId, userRole);
    res.status(201).json({ message: 'Empresa creada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
```

### 3.5 Routes — `src/routes/company.routes.ts`

```
GET    /api/companies                → getCompanies        (todos los roles)
GET    /api/companies/stats          → getCompaniesStats   (solo PAYPAC)
GET    /api/companies/my-companies   → getMyCompanies      (ORGANIZER)
GET    /api/companies/my-profile     → getMyCompany        (ORGANIZER, PAYPAC)
GET    /api/companies/:id            → getCompanyById      (todos los roles)
GET    /api/companies/:id/followers  → getCompanyFollowers (todos los roles)
POST   /api/companies                → createCompany       (PAYPAC, ORGANIZER)
PUT    /api/companies/:id            → updateCompany       (PAYPAC, ORGANIZER)
PATCH  /api/companies/:id/approve    → approveCompany      (PAYPAC)
PATCH  /api/companies/:id/status     → updateCompanyStatus (PAYPAC)
DELETE /api/companies/:id            → deleteCompany       (PAYPAC)
```

> ⚠️ Las rutas con paths literales (`/stats`, `/my-companies`) deben ir ANTES de `/:id`.

---

## 4. index.ts — Entry Point

```typescript
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

// ── Importar rutas ────────────────────────────────────────────────
import authRoutes    from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import eventRoutes   from './routes/event.routes';
import publicRouter  from './routes/public';
// ... (resto de rutas)

const app    = express();
app.set('trust proxy', 1);    // ← NECESARIO para Railway / proxies
const server = http.createServer(app);
const io     = new SocketIOServer(server, { cors: { origin: [...], methods: [...] } });

// ── CORS ───────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'https://paypac.co', /* ... */];
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Web-API-Key'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health checks ──────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Rutas con autenticación Firebase ──────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/events',    eventRoutes);
// ...

// ── Rutas públicas (X-Web-API-Key) ────────────────────────────────
app.use('/api/public', publicRouter);

// ── Webhooks (sin auth) ───────────────────────────────────────────
app.use('/api/webhooks', webhookRoutes);

// ── CRON Jobs ─────────────────────────────────────────────────────
startEmailQueueProcessor();    // procesa cola cada 5 min
startEmailQueueCleaner();      // limpia logs diariamente
startEventFinalizer();
startTicketTransferExpiry();

// ── Socket.IO ─────────────────────────────────────────────────────
setupTicketSocketHandlers(io);
setupNotificationSocketHandlers(io);

server.listen({ port: Number(process.env.PORT) || 5000, host: '0.0.0.0' });
export { io, server };
```

---

## 5. Auth — Cómo Funciona y Middlewares

### Flujo de autenticación

```
Flutter/Web                Firebase Auth         Backend (Node.js)
    │                           │                      │
    │── POST /register ─────────────────────────────►  │
    │                           │   createUser()        │
    │                           │◄──────────────────── │
    │                           │   setCustomClaims()   │
    │◄──── { customToken } ─────────────────────────── │
    │                           │                      │
    │── signInWithCustomToken() ►                      │
    │◄── { idToken (JWT) } ─────                       │
    │                           │                      │
    │── GET /api/... ────────────── Authorization: Bearer {idToken} ──► │
    │                           │   verifyIdToken()    │
    │                           │◄───────────────────  │
    │                           │   findUnique(firebase_uid)           │
    │◄──────────────────── { data } ────────────────── │
```

### `src/config/firebase.ts`

Firebase Admin SDK soporta 3 modos de init según entorno:
1. **`FIREBASE_PRIVATE_KEY`** presente → Service Account Key (Staging/Railway)
2. **`NODE_ENV=development`** → Application Default Credentials (`gcloud auth app-default login`)
3. **Ninguno** → Workload Identity (Cloud Run, GKE)

### `src/middlewares/auth.middleware.ts` — `authenticate`

```typescript
export const authenticate = async (req, res, next): Promise<void> => {
  const idToken = req.headers.authorization?.split(' ')[1];
  if (!idToken) { res.status(401).json({ message: 'Token no proporcionado' }); return; }

  const decodedToken = await firebaseAuth.verifyIdToken(idToken);
  // Firebase Admin cachea JWKS keys → primera llamada ~300ms, resto ~2-5ms (crypto local)

  const user = await prisma.user.findUnique({ where: { firebase_uid: decodedToken.uid } });
  // findUnique usa índice @unique → O(1)

  if (!user) { res.status(401).json({ message: 'Usuario no encontrado' }); return; }

  req.user = user;  // ← inyecta el User de Prisma en el request
  next();
};
```

### `src/middlewares/role.middleware.ts` — `authorizeRoles`

```typescript
export const authorizeRoles = (...allowedRoles: string[]) =>
  (req, res, next): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
      return;
    }
    next();
  };
```

### `src/middlewares/validate.middleware.ts` — `validateRequest`

```typescript
export const validateRequest = (schema: ZodType) =>
  (req, res, next) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Error de validación', issues: error.issues });
      }
    }
  };
```

**Schema de Zod estándar:**
```typescript
export const createXSchema = z.object({
  body:   z.object({ campo: z.string().min(2) }),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query:  z.object({ search: z.string().optional() }).optional(),
});
```

### `src/middlewares/authenticatePublicWeb.ts` — Para endpoints sin login

```typescript
export const authenticatePublicWeb = (req, res, next): void => {
  const apiKey = req.headers['x-web-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!apiKey || apiKey !== process.env.WEB_API_KEY) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing web API key' });
    return;
  }
  next();
};
```

### `src/types/express.d.ts` — Augmentación de tipos

```typescript
import { User } from '@prisma/client';
declare global {
  namespace Express {
    interface Request {
      user?: User;  // req.user es tipado como el modelo User de Prisma
    }
  }
}
export {};
```

### Endpoints de auth

```
POST /api/auth/register          → Público — auto-registro CUSTOMER
POST /api/auth/new-user          → Protegido — PAYPAC/ORGANIZER crean usuarios
GET  /api/auth/me                → Protegido — perfil del usuario autenticado
```

---

## 6. Configuración BD y Brevo

### Base de datos — `src/config/db.ts` y `src/prisma/client.ts`

```typescript
// Dos archivos, mismo propósito — ambos exportan la misma instancia Prisma
// src/config/db.ts (usado por repositories)
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// src/prisma/client.ts (usado por services directos)
import { PrismaClient, Prisma } from '@prisma/client';
export const prisma = new PrismaClient();
export { Prisma };
```

**`prisma/schema.prisma` — configuración:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Variables de entorno requeridas:**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
```

### Brevo (emails transaccionales) — `src/config/brevo.ts`

```typescript
import * as brevo from '@getbrevo/brevo';

export const brevoConfig = {
  apiKey:      process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'notifications@empresa.com',
  senderName:  process.env.BREVO_SENDER_NAME  || 'Notificaciones',
};

export const brevoApiInstance = new brevo.TransactionalEmailsApi();
brevoApiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoConfig.apiKey);

export const validateBrevoConfig = (): void => {
  if (!brevoConfig.apiKey) throw new Error('BREVO_API_KEY no configurada');
  console.log('✅ Brevo API configurada correctamente');
};
```

**Servicio — `src/services/brevo.service.ts`:**
```typescript
export class BrevoService {
  async sendEmail(params: { to: { email: string; name: string }; subject: string; htmlContent: string }) {
    const email = new brevo.SendSmtpEmail();
    email.subject     = params.subject;
    email.to          = [params.to];
    email.htmlContent = params.htmlContent;
    email.sender      = { name: brevoConfig.senderName, email: brevoConfig.senderEmail };
    const result = await brevoApiInstance.sendTransacEmail(email);
    return { success: true, messageId: result.body?.messageId };
  }
}
```

**Variables de entorno requeridas:**
```env
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@empresa.com
BREVO_SENDER_NAME=Sistema Empresa
```

---

## 7. Variables de Entorno Completas (.env)

```env
# ── Base de datos ────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/db

# ── Firebase ─────────────────────────────────────────
FIREBASE_PROJECT_ID=proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@proyecto.iam.gserviceaccount.com

# ── Brevo (emails) ───────────────────────────────────
BREVO_API_KEY=xkeysib-xxx
BREVO_SENDER_EMAIL=noreply@empresa.com
BREVO_SENDER_NAME=Empresa Notificaciones

# ── Web pública ──────────────────────────────────────
WEB_API_KEY=empresa-web-secret-2026-xxx
DEFAULT_COUNTRY_ID=1

# ── Rate limits ──────────────────────────────────────
WEB_RATE_LIMIT_EVENTS=60
WEB_RATE_LIMIT_DETAIL=100

# ── AWS S3 (archivos) ────────────────────────────────
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_DEFAULT_REGION=us-east-1
AWS_S3_BUCKET=nombre-bucket

# ── General ──────────────────────────────────────────
PORT=5000
NODE_ENV=development
APP_URL=https://api.empresa.com
```

---

## 8. Patrones Importantes para Replicar

### 8.1 Cada entidad sigue el mismo patrón de archivos

```
src/validators/entidad.validation.ts    ← Zod schemas
src/repositories/entidad.repository.ts  ← Prisma queries
src/services/entidad.service.ts         ← Lógica de negocio + control de roles
src/controllers/entidad.controller.ts   ← try/catch + req/res
src/routes/entidad.routes.ts            ← Router con middlewares
```

### 8.2 Registro en `src/index.ts`

```typescript
import entidadRoutes from './routes/entidad.routes';
app.use('/api/entidades', entidadRoutes);
```

### 8.3 Control de acceso en servicios (no en controllers)

```typescript
// ✅ Correcto — la lógica de roles va en el SERVICE
async createEntidad(data, userId, userRole) {
  if (!['SUPER_ADMIN', 'JEFE_SELECCION'].includes(userRole)) {
    throw new Error('Sin permisos');
  }
  // ...
}
```

### 8.4 Rollback en auth

Si falla la creación en PostgreSQL después de crear en Firebase → eliminar el usuario de Firebase para evitar inconsistencias.

---

## 9. Instrucciones para Crear una Réplica (ATS — Sistema de Selección)

> **Roles del sistema a crear:**
> | Rol | Acceso |
> |-----|--------|
> | SUPER_ADMIN | Todo el sistema |
> | JEFE_SELECCION | Vacantes, ATS, dashboard completo |
> | SECRETARIA | Pipeline, candidatos, notificaciones |
> | JEFE_AREA | Solo evaluación de entrevistas presenciales |

---

### Paso 1 — Inicializar proyecto

```bash
mkdir ats-backend && cd ats-backend
npm init -y
npm install express cors dotenv @prisma/client firebase-admin @getbrevo/brevo \
  express-rate-limit zod bcrypt jsonwebtoken node-cron luxon socket.io dotenv
npm install -D typescript tsx prisma @types/express @types/node @types/node-cron ts-node-dev

npx tsc --init
npx prisma init
```

Ajustar `tsconfig.json` igual al de referencia (ver sección 2).

Ajustar `package.json` scripts:
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node build/index.js",
  "postinstall": "prisma generate"
}
```

---

### Paso 2 — Crear el enum de roles y el modelo User en Prisma

**Archivo:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── ENUMS ─────────────────────────────────────────────────────────

enum ROLES {
  SUPER_ADMIN       // Todo el sistema, ambas plantas
  JEFE_SELECCION    // Vacantes, ATS, dashboard completo
  SECRETARIA        // Pipeline, candidatos, notificaciones
  JEFE_AREA         // Solo evaluación de entrevistas presenciales
}

enum DocType {
  CC
  CE
  NIT
  PASAPORTE
}

// ── MODELOS ───────────────────────────────────────────────────────

model User {
  id                       Int       @id @default(autoincrement())
  email                    String    @unique
  name                     String
  last_name                String
  password                 String
  phone_number             String
  role                     ROLES     @default(SECRETARIA)
  status                   Int       @default(1)          // 1: activo, 0: inactivo
  firebase_uid             String?   @unique
  auth_method              String?   @default("firebase")
  fcm_token                String?
  email_verified_at        DateTime?
  num_doc                  String?
  type_doc                 DocType?
  birth_date               DateTime?
  area                     String?                        // Área del jefe (solo JEFE_AREA)
  plant                    String?                        // Planta asignada (para multi-planta)
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt

  @@index([email])
  @@index([firebase_uid])
  @@index([role])
}
```

**Ejecutar migración:**
```bash
npx prisma migrate dev --name init_user
npx prisma generate
```

---

### Paso 3 — Estructura mínima de archivos a crear

Crear la siguiente estructura antes de implementar:

```bash
mkdir -p src/{config,controllers,middlewares,repositories,routes,services,types,validators,utils}
```

**Archivos a crear en orden:**

#### `src/types/express.d.ts`
```typescript
import { User } from '@prisma/client';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export {};
```

#### `src/prisma/client.ts`
```typescript
import { PrismaClient, Prisma } from '@prisma/client';
export const prisma = new PrismaClient();
export { Prisma };
```

#### `src/config/firebase.ts`
(Copiar igual del proyecto de referencia — sección 5)

#### `src/config/brevo.ts`
(Copiar igual del proyecto de referencia — sección 6)

#### `src/middlewares/auth.middleware.ts`
(Copiar igual del proyecto de referencia — sección 5)

#### `src/middlewares/role.middleware.ts`
(Copiar igual del proyecto de referencia — sección 5)

#### `src/middlewares/validate.middleware.ts`
(Copiar igual del proyecto de referencia — sección 5)

---

### Paso 4 — Implementar User Repository, Service, Controller, Routes

Siguiendo el mismo patrón del CRUD de Company (sección 3), pero para User:

**`src/repositories/user.repository.ts`:**
- `findByEmail(email)` — para registro
- `findByFirebaseUid(uid)` — para auth
- `create(data)` — nuevo usuario
- `findById(id)` — perfil
- `findAll(filters)` — listado (SUPER_ADMIN)
- `update(id, data)` — actualizar perfil
- `updateStatus(id, status)` — activar/desactivar

**`src/services/auth.service.ts`:**
- `register(data, createdBy?)` — igual al de referencia con rollback Firebase
- Lógica de roles: solo SUPER_ADMIN puede crear JEFE_SELECCION/JEFE_AREA; JEFE_SELECCION puede crear SECRETARIA

---

### Paso 5 — Registrar el control de acceso por rol

En cada service, aplicar la tabla de permisos:

```typescript
const ROLE_PERMISSIONS = {
  SUPER_ADMIN:    ['*'],                        // Todo
  JEFE_SELECCION: ['vacantes', 'ats', 'reportes', 'candidatos', 'notificaciones'],
  SECRETARIA:     ['pipeline', 'candidatos', 'notificaciones'],
  JEFE_AREA:      ['evaluaciones_presenciales'],
} as const;

// En cada service:
async crearVacante(data, userRole) {
  if (!['SUPER_ADMIN', 'JEFE_SELECCION'].includes(userRole)) {
    throw new Error('Sin permisos para crear vacantes');
  }
  // ...
}

async evaluarEntrevista(data, userRole) {
  if (!['SUPER_ADMIN', 'JEFE_AREA'].includes(userRole)) {
    throw new Error('Solo el Jefe de Área puede registrar evaluaciones');
  }
  // ...
}
```

---

### Paso 6 — `src/index.ts` mínimo

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
// import ... (resto de rutas del ATS)

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:3000', 'https://ats.empresa.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/vacantes', vacantesRoutes);
// app.use('/api/candidatos', candidatosRoutes);
// app.use('/api/entrevistas', entrevistasRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`✅ Servidor ATS corriendo en puerto ${PORT}`);
});
```

---

### Resumen de diferencias con PayPac para el ATS

| Aspecto | PayPac (referencia) | ATS (nuevo) |
|---------|---------------------|-------------|
| Roles | PAYPAC, ORGANIZER, STAFF, PROMOTER, CUSTOMER | SUPER_ADMIN, JEFE_SELECCION, SECRETARIA, JEFE_AREA |
| Auth | Firebase ID Token | Firebase ID Token (mismo middleware) |
| Dominio | Eventos y tickets | Vacantes, candidatos, entrevistas |
| Socket.IO | Tickets en tiempo real | Notificaciones de pipeline |
| Cron jobs | Finalizar eventos, expirar tickets | Recordatorios de entrevistas, limpieza de pipeline |
| Emails | Registro, invitación | Notificaciones de candidatos, confirmaciones |
| BD | PostgreSQL + Prisma | PostgreSQL + Prisma (mismo stack) |
| Deploy | Railway | Railway (mismo approach) |

---

*Generado: 2026-05-07 — Versión: 1.0*
