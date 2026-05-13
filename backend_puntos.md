# PayPac Backend - Sistemas Sociales y Puntos

**Fecha:** 7 de Mayo, 2026  
**Autor:** Especificación completa  
**Versión:** 1.0

---

## 📋 Índice

1. [Sistema de Puntos](#1-sistema-de-puntos)
2. [Sistema de Intereses](#2-sistema-de-intereses)
3. [Sistema de Seguidores/Amigos](#3-sistema-de-seguidoresamigos)
4. [Sistema de Notificaciones](#4-sistema-de-notificaciones)
5. [Actualización del Modelo Event](#5-actualización-del-modelo-event)

---

## ✅ Pre-requisitos

### Migración aplicada

La migración `20260507_add_points_interests_followers_notifications` ya fue aplicada en Railway y contiene:

- 6 tablas nuevas: `UserPointsBalance`, `PointsTransaction`, `UserInterest`, `UserFollower`, `NotificationPreference`, `NotificationQueue`
- 5 enums nuevos: `PointsTransactionType`, `InterestSource`, `FollowStatus`, `NotificationType`, `NotificationChannel`, `NotificationStatus`

### Esquema Prisma actualizado

Las relaciones ya están agregadas en:
- Modelo `User`
- Modelos `Category`, `SubCategory`, `Subgenre`

---

# 1. Sistema de Puntos

## 1.1 Reglas de Negocio

| Regla | Valor |
|-------|-------|
| **Tasa de ganancia** | 1 punto por cada $100 COP gastados |
| **Base de cálculo** | `total_ticket_regular` (sin comisiones de PayPac) |
| **Expiración** | 365 días desde la fecha de ganancia |
| **Tasa de canje** | 10 puntos = $1,000 COP de descuento |
| **Transferencias** | Usuario A puede transferir puntos a Usuario B |

### Cálculos de ejemplo

```
Compra: $85,000 COP (total_ticket_regular)
Puntos ganados: Math.floor(85000 / 100) = 850 puntos
Expiran el: createdAt + 365 días

Usuario tiene: 1000 puntos
Canjea: 500 puntos
Descuento aplicado: Math.floor(500 / 10) * 1000 = $50,000 COP
Balance final: 500 puntos
```

---

## 1.2 Constantes Globales

**Archivo:** `src/config/constants.ts`

```typescript
// ============================================
// SISTEMA DE PUNTOS
// ============================================
export const POINTS_CONFIG = {
  COST_POINT: 100,              // $100 COP = 1 punto
  COST_EXPIRATION_POINT: 365,   // Días hasta expiración
  REDEMPTION_RATE: 10,          // 10 puntos = $1,000 descuento
  REDEMPTION_UNIT: 1000         // Unidad de canje
} as const;

// Helpers
export const calculatePointsFromAmount = (amount: number): number => {
  return Math.floor(amount / POINTS_CONFIG.COST_POINT);
};

export const calculateDiscountFromPoints = (points: number): number => {
  return Math.floor(points / POINTS_CONFIG.REDEMPTION_RATE) * POINTS_CONFIG.REDEMPTION_UNIT;
};

export const calculateExpirationDate = (fromDate: Date = new Date()): Date => {
  const expirationDate = new Date(fromDate);
  expirationDate.setDate(expirationDate.getDate() + POINTS_CONFIG.COST_EXPIRATION_POINT);
  return expirationDate;
};
```

---

## 1.3 Endpoints

Todos los endpoints requieren autenticación con rol `CUSTOMER`.

### 1.3.1 GET /api/points/balance

Obtener balance de puntos del usuario autenticado.

**Request:**
```
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "balance": {
    "user_id": 123,
    "current_balance": 850,
    "total_earned": 2500,
    "total_redeemed": 1000,
    "total_expired": 650,
    "last_earned_at": "2026-05-01T10:30:00Z",
    "last_redeemed_at": "2026-04-15T14:20:00Z"
  }
}
```

---

### 1.3.2 GET /api/points/history

Obtener historial de transacciones de puntos.

**Query params:**
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): resultados por página (default: 20, max: 100)
- `type` (opcional): filtrar por tipo de transacción (EARNED, REDEEMED, EXPIRED, TRANSFER_SENT, TRANSFER_RECEIVED)

**Request:**
```
GET /api/points/history?page=1&limit=20&type=EARNED
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": 456,
      "transaction_type": "EARNED",
      "points_amount": 850,
      "balance_before": 1000,
      "balance_after": 1850,
      "reference_type": "INVOICE",
      "reference_id": 789,
      "description": "Puntos ganados por compra de tickets",
      "expires_at": "2027-05-01T10:30:00Z",
      "expired": false,
      "createdAt": "2026-05-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 1.3.3 POST /api/points/transfer

Transferir puntos a otro usuario.

**Request:**
```json
{
  "to_user_id": 456,
  "points": 100,
  "description": "Regalo de cumpleaños" // opcional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transferencia exitosa",
  "sent_transaction": {
    "id": 789,
    "transaction_type": "TRANSFER_SENT",
    "points_amount": -100,
    "balance_after": 750,
    "transfer_to_user_id": 456,
    "transfer_pair_id": 790,
    "createdAt": "2026-05-07T15:30:00Z"
  },
  "received_transaction": {
    "id": 790,
    "transaction_type": "TRANSFER_RECEIVED",
    "points_amount": 100,
    "balance_after": 200,
    "transfer_from_user_id": 123,
    "transfer_pair_id": 789,
    "createdAt": "2026-05-07T15:30:00Z"
  }
}
```

**Errores:**
- `400 Bad Request`: "No puedes transferir puntos a ti mismo"
- `400 Bad Request`: "Saldo insuficiente. Disponible: X, Solicitado: Y"
- `400 Bad Request`: "La cantidad de puntos debe ser mayor a 0"
- `404 Not Found`: "Usuario receptor no encontrado"

---

### 1.3.4 GET /api/points/expiring

Obtener puntos próximos a expirar (30 días).

**Request:**
```
GET /api/points/expiring
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "expiring_soon": [
    {
      "id": 123,
      "points_amount": 200,
      "expires_at": "2026-06-01T00:00:00Z",
      "days_remaining": 25
    },
    {
      "id": 124,
      "points_amount": 150,
      "expires_at": "2026-06-05T00:00:00Z",
      "days_remaining": 29
    }
  ],
  "total_expiring": 350
}
```

---

## 1.4 Validaciones Zod

**Archivo:** `src/validations/points.validation.ts`

```typescript
import { z } from 'zod';

export const transferPointsSchema = z.object({
  body: z.object({
    to_user_id: z.number().int().positive({ message: 'ID de usuario inválido' }),
    points: z.number().int().positive({ message: 'La cantidad de puntos debe ser positiva' }),
    description: z.string().max(500).optional()
  })
});

export const getHistorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.enum(['EARNED', 'REDEEMED', 'EXPIRED', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'ADJUSTMENT', 'BONUS', 'REFUND']).optional()
  })
});
```

---

## 1.5 Servicio

**Archivo:** `src/services/points.service.ts`

```typescript
import { prisma } from '../config/database';
import { calculatePointsFromAmount, calculateExpirationDate, POINTS_CONFIG } from '../config/constants';

export class PointsService {
  
  /**
   * Obtener balance de puntos de un usuario
   */
  async getBalance(userId: number) {
    let balance = await prisma.userPointsBalance.findUnique({
      where: { user_id: userId }
    });

    // Si no existe, crear balance inicial
    if (!balance) {
      balance = await prisma.userPointsBalance.create({
        data: {
          user_id: userId,
          current_balance: 0,
          total_earned: 0,
          total_redeemed: 0,
          total_expired: 0
        }
      });
    }

    return balance;
  }

  /**
   * Obtener historial de transacciones
   */
  async getHistory(userId: number, page: number = 1, limit: number = 20, type?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = { user_id: userId };
    if (type) {
      where.transaction_type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.pointsTransaction.count({ where })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Transferir puntos entre usuarios
   */
  async transferPoints(fromUserId: number, toUserId: number, points: number, description?: string) {
    // Validaciones
    if (fromUserId === toUserId) {
      throw new Error('No puedes transferir puntos a ti mismo');
    }

    if (points <= 0) {
      throw new Error('La cantidad de puntos debe ser mayor a 0');
    }

    // Verificar que el usuario receptor existe
    const recipientUser = await prisma.user.findUnique({
      where: { id: toUserId }
    });

    if (!recipientUser) {
      throw new Error('Usuario receptor no encontrado');
    }

    // Transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener balance del remitente
      const senderBalance = await tx.userPointsBalance.findUnique({
        where: { user_id: fromUserId }
      });

      if (!senderBalance) {
        throw new Error('El usuario remitente no tiene balance de puntos');
      }

      if (senderBalance.current_balance < points) {
        throw new Error(`Saldo insuficiente. Disponible: ${senderBalance.current_balance}, Solicitado: ${points}`);
      }

      // 2. Obtener o crear balance del receptor
      let recipientBalance = await tx.userPointsBalance.findUnique({
        where: { user_id: toUserId }
      });

      if (!recipientBalance) {
        recipientBalance = await tx.userPointsBalance.create({
          data: {
            user_id: toUserId,
            current_balance: 0,
            total_earned: 0
          }
        });
      }

      // 3. Crear transacción SENT (remitente)
      const sentTransaction = await tx.pointsTransaction.create({
        data: {
          user_id: fromUserId,
          balance_id: senderBalance.id,
          transaction_type: 'TRANSFER_SENT',
          points_amount: -points,
          balance_before: senderBalance.current_balance,
          balance_after: senderBalance.current_balance - points,
          transfer_to_user_id: toUserId,
          description: description || `Transferencia de puntos a usuario ${toUserId}`
        }
      });

      // 4. Crear transacción RECEIVED (receptor)
      const receivedTransaction = await tx.pointsTransaction.create({
        data: {
          user_id: toUserId,
          balance_id: recipientBalance.id,
          transaction_type: 'TRANSFER_RECEIVED',
          points_amount: points,
          balance_before: recipientBalance.current_balance,
          balance_after: recipientBalance.current_balance + points,
          transfer_from_user_id: fromUserId,
          transfer_pair_id: sentTransaction.id,
          description: description || `Transferencia de puntos desde usuario ${fromUserId}`
        }
      });

      // 5. Actualizar transfer_pair_id del remitente
      await tx.pointsTransaction.update({
        where: { id: sentTransaction.id },
        data: { transfer_pair_id: receivedTransaction.id }
      });

      // 6. Actualizar balance del remitente
      await tx.userPointsBalance.update({
        where: { id: senderBalance.id },
        data: {
          current_balance: { decrement: points }
        }
      });

      // 7. Actualizar balance del receptor
      await tx.userPointsBalance.update({
        where: { id: recipientBalance.id },
        data: {
          current_balance: { increment: points },
          total_earned: { increment: points },
          last_earned_at: new Date()
        }
      });

      return { sentTransaction, receivedTransaction };
    });

    // Notificaciones (fuera de la transacción)
    await Promise.all([
      prisma.notificationQueue.create({
        data: {
          user_id: fromUserId,
          notification_type: 'POINTS_TRANSFER_SENT',
          channel: 'PUSH',
          title: 'Puntos enviados',
          body: `Has transferido ${points} puntos exitosamente`
        }
      }),
      prisma.notificationQueue.create({
        data: {
          user_id: toUserId,
          notification_type: 'POINTS_TRANSFER_RECEIVED',
          channel: 'PUSH',
          title: '¡Recibiste puntos!',
          body: `Has recibido ${points} puntos`
        }
      })
    ]);

    return {
      success: true,
      message: 'Transferencia exitosa',
      sentTransaction: result.sentTransaction,
      receivedTransaction: result.receivedTransaction
    };
  }

  /**
   * Obtener puntos próximos a expirar (30 días)
   */
  async getExpiringPoints(userId: number) {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const expiringTransactions = await prisma.pointsTransaction.findMany({
      where: {
        user_id: userId,
        transaction_type: 'EARNED',
        expired: false,
        expires_at: {
          gte: now,
          lte: in30Days
        }
      },
      orderBy: { expires_at: 'asc' }
    });

    const expiring_soon = expiringTransactions.map(tx => ({
      id: tx.id,
      points_amount: tx.points_amount,
      expires_at: tx.expires_at,
      days_remaining: Math.ceil((tx.expires_at!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }));

    const total_expiring = expiring_soon.reduce((sum, item) => sum + item.points_amount, 0);

    return {
      expiring_soon,
      total_expiring
    };
  }

  /**
   * Otorgar puntos por compra (llamar desde invoice webhook)
   */
  async awardPointsForPurchase(userId: number, invoiceId: number, amount: number) {
    const points = calculatePointsFromAmount(amount);
    const expiresAt = calculateExpirationDate();

    // Obtener o crear balance
    let balance = await this.getBalance(userId);

    // Crear transacción
    const transaction = await prisma.pointsTransaction.create({
      data: {
        user_id: userId,
        balance_id: balance.id,
        transaction_type: 'EARNED',
        points_amount: points,
        balance_before: balance.current_balance,
        balance_after: balance.current_balance + points,
        reference_type: 'INVOICE',
        reference_id: invoiceId,
        description: `Puntos ganados por compra de tickets`,
        expires_at: expiresAt
      }
    });

    // Actualizar balance
    await prisma.userPointsBalance.update({
      where: { id: balance.id },
      data: {
        current_balance: { increment: points },
        total_earned: { increment: points },
        last_earned_at: new Date()
      }
    });

    // Notificación
    await prisma.notificationQueue.create({
      data: {
        user_id: userId,
        notification_type: 'POINTS_EARNED',
        channel: 'PUSH',
        title: '🎉 Ganaste puntos!',
        body: `Has ganado ${points} puntos por tu compra`
      }
    });

    return transaction;
  }
}
```

---

## 1.6 Controlador

**Archivo:** `src/controllers/points.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PointsService } from '../services/points.service';

const pointsService = new PointsService();

export class PointsController {
  
  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const balance = await pointsService.getBalance(userId);
      
      res.status(200).json({ balance });
    } catch (error: any) {
      console.error('Error in getBalance:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch points balance'
      });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;
      const type = req.query.type as string | undefined;

      const result = await pointsService.getHistory(userId, page, limit, type);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getHistory:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch points history'
      });
    }
  }

  async transferPoints(req: Request, res: Response) {
    try {
      const fromUserId = req.user!.id;
      const { to_user_id, points, description } = req.body;

      const result = await pointsService.transferPoints(
        fromUserId,
        to_user_id,
        points,
        description
      );
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in transferPoints:', error);
      
      if (error.message.includes('No puedes transferir') || 
          error.message.includes('Saldo insuficiente') ||
          error.message.includes('cantidad de puntos')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to transfer points'
      });
    }
  }

  async getExpiringPoints(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await pointsService.getExpiringPoints(userId);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getExpiringPoints:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch expiring points'
      });
    }
  }
}
```

---

## 1.7 Rutas

**Archivo:** `src/routes/points.routes.ts`

```typescript
import { Router } from 'express';
import { PointsController } from '../controllers/points.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { transferPointsSchema, getHistorySchema } from '../validations/points.validation';

const router = Router();
const pointsController = new PointsController();

// Todas las rutas requieren autenticación con rol CUSTOMER
router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

// GET /api/points/balance - Obtener balance de puntos
router.get('/balance', pointsController.getBalance.bind(pointsController));

// GET /api/points/history - Obtener historial de transacciones
router.get(
  '/history',
  validateRequest(getHistorySchema),
  pointsController.getHistory.bind(pointsController)
);

// POST /api/points/transfer - Transferir puntos a otro usuario
router.post(
  '/transfer',
  validateRequest(transferPointsSchema),
  pointsController.transferPoints.bind(pointsController)
);

// GET /api/points/expiring - Obtener puntos próximos a expirar
router.get('/expiring', pointsController.getExpiringPoints.bind(pointsController));

export default router;
```

**Registrar en:** `src/index.ts`

```typescript
import pointsRoutes from './routes/points.routes';

// ...
app.use('/api/points', pointsRoutes);
```

---

## 1.8 Integración con Invoice Webhook

**En:** `src/services/invoice.service.ts` o donde se maneje el webhook de Wompi

```typescript
import { PointsService } from './points.service';

// Después de que el webhook confirme status APPROVED
async function handleApprovedInvoice(invoice: Invoice) {
  // ... lógica existente ...

  // Otorgar puntos al usuario
  const pointsService = new PointsService();
  await pointsService.awardPointsForPurchase(
    invoice.user_id,
    invoice.id,
    invoice.total_ticket_regular
  );
}
```

---

# 2. Sistema de Intereses

## 2.1 Reglas de Negocio

| Concepto | Descripción |
|----------|-------------|
| **Registro manual** | Usuario selecciona categorías/subcategorías/subgéneros en su perfil |
| **Registro automático** | Sistema infiere intereses por compras de tickets (`source: PURCHASE`) |
| **Inferencia por visualización** | Sistema registra intereses por visualización de eventos (`source: VIEW`) |
| **Nivel de interés** | Escala 1-5 (1: bajo interés, 5: muy alto interés) |
| **Unicidad** | Un usuario no puede tener el mismo interés duplicado |

---

## 2.2 Endpoints

Todos los endpoints requieren autenticación con rol `CUSTOMER`.

### 2.2.1 GET /api/interests/my-interests

Obtener intereses del usuario autenticado.

**Request:**
```
GET /api/interests/my-interests
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "interests": [
    {
      "id": 123,
      "category_id": 1,
      "category_name": "Música",
      "subcategory_id": 5,
      "subcategory_name": "Rock",
      "subgenre_id": 12,
      "subgenre_name": "Rock Alternativo",
      "interest_level": 5,
      "source": "MANUAL",
      "createdAt": "2026-05-01T10:30:00Z"
    },
    {
      "id": 124,
      "category_id": 2,
      "category_name": "Deportes",
      "subcategory_id": null,
      "subcategory_name": null,
      "subgenre_id": null,
      "subgenre_name": null,
      "interest_level": 3,
      "source": "PURCHASE",
      "createdAt": "2026-04-15T14:20:00Z"
    }
  ]
}
```

---

### 2.2.2 POST /api/interests

Agregar un interés manualmente.

**Request:**
```json
{
  "category_id": 1,
  "subcategory_id": 5,     // opcional
  "subgenre_id": 12,       // opcional
  "interest_level": 5      // 1-5
}
```

**Response:** `201 Created`
```json
{
  "interest": {
    "id": 125,
    "user_id": 123,
    "category_id": 1,
    "subcategory_id": 5,
    "subgenre_id": 12,
    "interest_level": 5,
    "source": "MANUAL",
    "createdAt": "2026-05-07T15:30:00Z"
  }
}
```

**Errores:**
- `400 Bad Request`: "Ya tienes este interés registrado"
- `404 Not Found`: "Categoría/subcategoría/subgénero no encontrado"

---

### 2.2.3 PATCH /api/interests/:id

Actualizar nivel de interés.

**Request:**
```json
{
  "interest_level": 4
}
```

**Response:** `200 OK`
```json
{
  "interest": {
    "id": 125,
    "interest_level": 4,
    "updatedAt": "2026-05-07T16:00:00Z"
  }
}
```

---

### 2.2.4 DELETE /api/interests/:id

Eliminar un interés.

**Request:**
```
DELETE /api/interests/125
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Interés eliminado exitosamente"
}
```

---

## 2.3 Validaciones Zod

**Archivo:** `src/validations/interests.validation.ts`

```typescript
import { z } from 'zod';

export const createInterestSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive(),
    subcategory_id: z.number().int().positive().optional(),
    subgenre_id: z.number().int().positive().optional(),
    interest_level: z.number().int().min(1).max(5)
  })
});

export const updateInterestSchema = z.object({
  body: z.object({
    interest_level: z.number().int().min(1).max(5)
  })
});
```

---

## 2.4 Servicio

**Archivo:** `src/services/interests.service.ts`

```typescript
import { prisma } from '../config/database';

export class InterestsService {
  
  /**
   * Obtener intereses de un usuario
   */
  async getMyInterests(userId: number) {
    const interests = await prisma.userInterest.findMany({
      where: { user_id: userId },
      include: {
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        },
        subgenre: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { interest_level: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return interests.map(interest => ({
      id: interest.id,
      category_id: interest.category_id,
      category_name: interest.category?.name || null,
      subcategory_id: interest.subcategory_id,
      subcategory_name: interest.subcategory?.name || null,
      subgenre_id: interest.subgenre_id,
      subgenre_name: interest.subgenre?.name || null,
      interest_level: interest.interest_level,
      source: interest.source,
      createdAt: interest.createdAt
    }));
  }

  /**
   * Crear un interés manual
   */
  async createInterest(
    userId: number,
    categoryId: number,
    subcategoryId: number | undefined,
    subgenreId: number | undefined,
    interestLevel: number
  ) {
    // Validar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Validar subcategoría si se proporciona
    if (subcategoryId) {
      const subcategory = await prisma.subCategory.findUnique({
        where: { id: subcategoryId }
      });

      if (!subcategory) {
        throw new Error('Subcategoría no encontrada');
      }
    }

    // Validar subgénero si se proporciona
    if (subgenreId) {
      const subgenre = await prisma.subgenre.findUnique({
        where: { id: subgenreId }
      });

      if (!subgenre) {
        throw new Error('Subgénero no encontrado');
      }
    }

    // Verificar que no existe ya
    const existing = await prisma.userInterest.findUnique({
      where: {
        user_id_category_id_subcategory_id_subgenre_id: {
          user_id: userId,
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
          subgenre_id: subgenreId || null
        }
      }
    });

    if (existing) {
      throw new Error('Ya tienes este interés registrado');
    }

    // Crear interés
    const interest = await prisma.userInterest.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        subgenre_id: subgenreId,
        interest_level: interestLevel,
        source: 'MANUAL'
      }
    });

    return interest;
  }

  /**
   * Actualizar nivel de interés
   */
  async updateInterest(userId: number, interestId: number, interestLevel: number) {
    // Verificar que el interés pertenece al usuario
    const interest = await prisma.userInterest.findFirst({
      where: {
        id: interestId,
        user_id: userId
      }
    });

    if (!interest) {
      throw new Error('Interés no encontrado');
    }

    const updated = await prisma.userInterest.update({
      where: { id: interestId },
      data: { interest_level: interestLevel }
    });

    return updated;
  }

  /**
   * Eliminar un interés
   */
  async deleteInterest(userId: number, interestId: number) {
    // Verificar que el interés pertenece al usuario
    const interest = await prisma.userInterest.findFirst({
      where: {
        id: interestId,
        user_id: userId
      }
    });

    if (!interest) {
      throw new Error('Interés no encontrado');
    }

    await prisma.userInterest.delete({
      where: { id: interestId }
    });
  }

  /**
   * Registrar interés automático por compra
   */
  async recordInterestFromPurchase(userId: number, categoryId: number, subcategoryId?: number, subgenreId?: number) {
    // Verificar si ya existe
    const existing = await prisma.userInterest.findUnique({
      where: {
        user_id_category_id_subcategory_id_subgenre_id: {
          user_id: userId,
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
          subgenre_id: subgenreId || null
        }
      }
    });

    if (existing) {
      // Si existe, incrementar nivel de interés (máximo 5)
      if (existing.interest_level < 5) {
        await prisma.userInterest.update({
          where: { id: existing.id },
          data: { 
            interest_level: Math.min(existing.interest_level + 1, 5),
            source: 'PURCHASE' // Actualizar source
          }
        });
      }
    } else {
      // Si no existe, crear con nivel 1
      await prisma.userInterest.create({
        data: {
          user_id: userId,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          subgenre_id: subgenreId,
          interest_level: 1,
          source: 'PURCHASE'
        }
      });
    }
  }
}
```

---

## 2.5 Controlador

**Archivo:** `src/controllers/interests.controller.ts`

```typescript
import { Request, Response } from 'express';
import { InterestsService } from '../services/interests.service';

const interestsService = new InterestsService();

export class InterestsController {
  
  async getMyInterests(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interests = await interestsService.getMyInterests(userId);
      
      res.status(200).json({ interests });
    } catch (error: any) {
      console.error('Error in getMyInterests:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch interests'
      });
    }
  }

  async createInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { category_id, subcategory_id, subgenre_id, interest_level } = req.body;

      const interest = await interestsService.createInterest(
        userId,
        category_id,
        subcategory_id,
        subgenre_id,
        interest_level
      );
      
      res.status(201).json({ interest });
    } catch (error: any) {
      console.error('Error in createInterest:', error);
      
      if (error.message.includes('Ya tienes este interés')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      if (error.message.includes('no encontrad')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to create interest'
      });
    }
  }

  async updateInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interestId = parseInt(req.params.id);
      const { interest_level } = req.body;

      const interest = await interestsService.updateInterest(userId, interestId, interest_level);
      
      res.status(200).json({ interest });
    } catch (error: any) {
      console.error('Error in updateInterest:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update interest'
      });
    }
  }

  async deleteInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interestId = parseInt(req.params.id);

      await interestsService.deleteInterest(userId, interestId);
      
      res.status(200).json({ message: 'Interés eliminado exitosamente' });
    } catch (error: any) {
      console.error('Error in deleteInterest:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to delete interest'
      });
    }
  }
}
```

---

## 2.6 Rutas

**Archivo:** `src/routes/interests.routes.ts`

```typescript
import { Router } from 'express';
import { InterestsController } from '../controllers/interests.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { createInterestSchema, updateInterestSchema } from '../validations/interests.validation';

const router = Router();
const interestsController = new InterestsController();

// Todas las rutas requieren autenticación con rol CUSTOMER
router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

// GET /api/interests/my-interests - Obtener intereses del usuario
router.get('/my-interests', interestsController.getMyInterests.bind(interestsController));

// POST /api/interests - Crear interés
router.post(
  '/',
  validateRequest(createInterestSchema),
  interestsController.createInterest.bind(interestsController)
);

// PATCH /api/interests/:id - Actualizar interés
router.patch(
  '/:id',
  validateRequest(updateInterestSchema),
  interestsController.updateInterest.bind(interestsController)
);

// DELETE /api/interests/:id - Eliminar interés
router.delete('/:id', interestsController.deleteInterest.bind(interestsController));

export default router;
```

**Registrar en:** `src/index.ts`

```typescript
import interestsRoutes from './routes/interests.routes';

// ...
app.use('/api/interests', interestsRoutes);
```

---

## 2.7 Integración con Invoice (registro automático)

**En:** `src/services/invoice.service.ts`

```typescript
import { InterestsService } from './interests.service';

// Después de crear tickets en webhook APPROVED
async function handleApprovedInvoice(invoice: Invoice) {
  // ... lógica existente ...

  // Registrar interés automático basado en evento comprado
  const event = await prisma.event.findUnique({
    where: { id: invoice.event_id },
    select: { category_id: true, subcategory_id: true, subgenre_id: true }
  });

  if (event) {
    const interestsService = new InterestsService();
    await interestsService.recordInterestFromPurchase(
      invoice.user_id,
      event.category_id,
      event.subcategory_id || undefined,
      event.subgenre_id || undefined
    );
  }
}
```

---

# 3. Sistema de Seguidores/Amigos

## 3.1 Reglas de Negocio

| Concepto | Descripción |
|----------|-------------|
| **Modelo** | Seguimiento directo (como Instagram), sin aprobación |
| **Estados** | ACTIVE (siguiendo), BLOCKED (bloqueado), MUTED (silenciado) |
| **Reciprocidad** | No requerida — A puede seguir a B sin que B siga a A |
| **Auto-seguimiento** | Prohibido — un usuario no puede seguirse a sí mismo |

---

## 3.2 Endpoints

Todos los endpoints requieren autenticación con rol `CUSTOMER`.

### 3.2.1 POST /api/followers/follow

Seguir a otro usuario.

**Request:**
```json
{
  "following_id": 456
}
```

**Response:** `201 Created`
```json
{
  "follow": {
    "id": 123,
    "follower_id": 123,
    "following_id": 456,
    "status": "ACTIVE",
    "createdAt": "2026-05-07T15:30:00Z"
  }
}
```

**Errores:**
- `400 Bad Request`: "No puedes seguirte a ti mismo"
- `400 Bad Request`: "Ya sigues a este usuario"
- `404 Not Found`: "Usuario no encontrado"

---

### 3.2.2 DELETE /api/followers/unfollow/:userId

Dejar de seguir a un usuario.

**Request:**
```
DELETE /api/followers/unfollow/456
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Has dejado de seguir al usuario"
}
```

---

### 3.2.3 GET /api/followers/my-followers

Obtener lista de seguidores (usuarios que me siguen).

**Query params:**
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): resultados por página (default: 20, max: 100)

**Request:**
```
GET /api/followers/my-followers?page=1&limit=20
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "followers": [
    {
      "id": 123,
      "follower_id": 456,
      "follower_name": "Juan Pérez",
      "follower_email": "juan@example.com",
      "status": "ACTIVE",
      "createdAt": "2026-05-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 3.2.4 GET /api/followers/my-following

Obtener lista de usuarios que sigo.

**Query params:**
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): resultados por página (default: 20, max: 100)

**Request:**
```
GET /api/followers/my-following?page=1&limit=20
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "following": [
    {
      "id": 124,
      "following_id": 789,
      "following_name": "María López",
      "following_email": "maria@example.com",
      "status": "ACTIVE",
      "createdAt": "2026-05-02T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 32,
    "total_pages": 2
  }
}
```

---

### 3.2.5 PATCH /api/followers/block/:userId

Bloquear a un usuario.

**Request:**
```
PATCH /api/followers/block/456
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Usuario bloqueado exitosamente"
}
```

---

### 3.2.6 PATCH /api/followers/mute/:userId

Silenciar a un usuario (no recibir notificaciones).

**Request:**
```
PATCH /api/followers/mute/456
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Usuario silenciado exitosamente"
}
```

---

### 3.2.7 PATCH /api/followers/unmute/:userId

Reactivar notificaciones de un usuario.

**Request:**
```
PATCH /api/followers/unmute/456
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Usuario reactivado exitosamente"
}
```

---

## 3.3 Validaciones Zod

**Archivo:** `src/validations/followers.validation.ts`

```typescript
import { z } from 'zod';

export const followUserSchema = z.object({
  body: z.object({
    following_id: z.number().int().positive({ message: 'ID de usuario inválido' })
  })
});

export const getPaginatedSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});
```

---

## 3.4 Servicio

**Archivo:** `src/services/followers.service.ts`

```typescript
import { prisma } from '../config/database';

export class FollowersService {
  
  /**
   * Seguir a un usuario
   */
  async followUser(followerId: number, followingId: number) {
    // Validar que no sea el mismo usuario
    if (followerId === followingId) {
      throw new Error('No puedes seguirte a ti mismo');
    }

    // Validar que el usuario a seguir existe
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId }
    });

    if (!userToFollow) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si ya existe la relación
    const existing = await prisma.userFollower.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (existing) {
      throw new Error('Ya sigues a este usuario');
    }

    // Crear relación
    const follow = await prisma.userFollower.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
        status: 'ACTIVE'
      }
    });

    // Notificar al usuario seguido
    await prisma.notificationQueue.create({
      data: {
        user_id: followingId,
        notification_type: 'FRIEND_REQUEST',
        channel: 'PUSH',
        title: 'Nuevo seguidor',
        body: `${userToFollow.name} comenzó a seguirte`
      }
    });

    return follow;
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (!follow) {
      throw new Error('No sigues a este usuario');
    }

    await prisma.userFollower.delete({
      where: { id: follow.id }
    });
  }

  /**
   * Obtener mis seguidores
   */
  async getMyFollowers(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.userFollower.findMany({
        where: { 
          following_id: userId,
          status: 'ACTIVE'
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.userFollower.count({
        where: { 
          following_id: userId,
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      followers: followers.map(f => ({
        id: f.id,
        follower_id: f.follower_id,
        follower_name: `${f.follower.name} ${f.follower.last_name}`,
        follower_email: f.follower.email,
        status: f.status,
        createdAt: f.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtener usuarios que sigo
   */
  async getMyFollowing(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.userFollower.findMany({
        where: { 
          follower_id: userId,
          status: 'ACTIVE'
        },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.userFollower.count({
        where: { 
          follower_id: userId,
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      following: following.map(f => ({
        id: f.id,
        following_id: f.following_id,
        following_name: `${f.following.name} ${f.following.last_name}`,
        following_email: f.following.email,
        status: f.status,
        createdAt: f.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Bloquear a un usuario
   */
  async blockUser(userId: number, targetUserId: number) {
    // Buscar relación de seguimiento (en cualquier dirección)
    const relations = await prisma.userFollower.findMany({
      where: {
        OR: [
          { follower_id: userId, following_id: targetUserId },
          { follower_id: targetUserId, following_id: userId }
        ]
      }
    });

    // Actualizar todas las relaciones a BLOCKED
    await Promise.all(
      relations.map(rel =>
        prisma.userFollower.update({
          where: { id: rel.id },
          data: { status: 'BLOCKED' }
        })
      )
    );
  }

  /**
   * Silenciar a un usuario
   */
  async muteUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (!follow) {
      throw new Error('No sigues a este usuario');
    }

    await prisma.userFollower.update({
      where: { id: follow.id },
      data: { status: 'MUTED' }
    });
  }

  /**
   * Reactivar notificaciones de un usuario
   */
  async unmuteUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (!follow) {
      throw new Error('No sigues a este usuario');
    }

    await prisma.userFollower.update({
      where: { id: follow.id },
      data: { status: 'ACTIVE' }
    });
  }
}
```

---

## 3.5 Controlador

**Archivo:** `src/controllers/followers.controller.ts`

```typescript
import { Request, Response } from 'express';
import { FollowersService } from '../services/followers.service';

const followersService = new FollowersService();

export class FollowersController {
  
  async followUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const { following_id } = req.body;

      const follow = await followersService.followUser(followerId, following_id);
      
      res.status(201).json({ follow });
    } catch (error: any) {
      console.error('Error in followUser:', error);
      
      if (error.message.includes('No puedes seguirte') || error.message.includes('Ya sigues')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to follow user'
      });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId);

      await followersService.unfollowUser(followerId, followingId);
      
      res.status(200).json({ message: 'Has dejado de seguir al usuario' });
    } catch (error: any) {
      console.error('Error in unfollowUser:', error);
      
      if (error.message.includes('No sigues')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to unfollow user'
      });
    }
  }

  async getMyFollowers(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;

      const result = await followersService.getMyFollowers(userId, page, limit);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getMyFollowers:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch followers'
      });
    }
  }

  async getMyFollowing(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;

      const result = await followersService.getMyFollowing(userId, page, limit);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getMyFollowing:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch following'
      });
    }
  }

  async blockUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.params.userId);

      await followersService.blockUser(userId, targetUserId);
      
      res.status(200).json({ message: 'Usuario bloqueado exitosamente' });
    } catch (error: any) {
      console.error('Error in blockUser:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to block user'
      });
    }
  }

  async muteUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId);

      await followersService.muteUser(followerId, followingId);
      
      res.status(200).json({ message: 'Usuario silenciado exitosamente' });
    } catch (error: any) {
      console.error('Error in muteUser:', error);
      
      if (error.message.includes('No sigues')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to mute user'
      });
    }
  }

  async unmuteUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId);

      await followersService.unmuteUser(followerId, followingId);
      
      res.status(200).json({ message: 'Usuario reactivado exitosamente' });
    } catch (error: any) {
      console.error('Error in unmuteUser:', error);
      
      if (error.message.includes('No sigues')) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to unmute user'
      });
    }
  }
}
```

---

## 3.6 Rutas

**Archivo:** `src/routes/followers.routes.ts`

```typescript
import { Router } from 'express';
import { FollowersController } from '../controllers/followers.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { followUserSchema, getPaginatedSchema } from '../validations/followers.validation';

const router = Router();
const followersController = new FollowersController();

// Todas las rutas requieren autenticación con rol CUSTOMER
router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

// POST /api/followers/follow - Seguir a un usuario
router.post(
  '/follow',
  validateRequest(followUserSchema),
  followersController.followUser.bind(followersController)
);

// DELETE /api/followers/unfollow/:userId - Dejar de seguir
router.delete('/unfollow/:userId', followersController.unfollowUser.bind(followersController));

// GET /api/followers/my-followers - Obtener seguidores
router.get(
  '/my-followers',
  validateRequest(getPaginatedSchema),
  followersController.getMyFollowers.bind(followersController)
);

// GET /api/followers/my-following - Obtener usuarios que sigo
router.get(
  '/my-following',
  validateRequest(getPaginatedSchema),
  followersController.getMyFollowing.bind(followersController)
);

// PATCH /api/followers/block/:userId - Bloquear usuario
router.patch('/block/:userId', followersController.blockUser.bind(followersController));

// PATCH /api/followers/mute/:userId - Silenciar usuario
router.patch('/mute/:userId', followersController.muteUser.bind(followersController));

// PATCH /api/followers/unmute/:userId - Reactivar notificaciones
router.patch('/unmute/:userId', followersController.unmuteUser.bind(followersController));

export default router;
```

**Registrar en:** `src/index.ts`

```typescript
import followersRoutes from './routes/followers.routes';

// ...
app.use('/api/followers', followersRoutes);
```

---

# 4. Sistema de Notificaciones

## 4.1 Reglas de Negocio

| Concepto | Descripción |
|----------|-------------|
| **Canales** | WEB, PUSH, WHATSAPP, EMAIL |
| **Preferencias** | Usuario puede activar/desactivar por tipo y canal |
| **Defaults** | WEB ✅, PUSH ✅, WHATSAPP ❌, EMAIL ✅ |
| **Email** | Usa sistema Brevo existente |
| **Cola** | Notificaciones se encolan y procesan asíncronamente |
| **Reintentos** | Máximo 3 intentos si falla el envío |

---

## 4.2 Endpoints

Todos los endpoints requieren autenticación con rol `CUSTOMER`.

### 4.2.1 GET /api/notifications/preferences

Obtener preferencias de notificación del usuario.

**Request:**
```
GET /api/notifications/preferences
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "preferences": [
    {
      "notification_type": "FRIEND_REQUEST",
      "channel_web": true,
      "channel_push": true,
      "channel_whatsapp": false,
      "channel_email": true
    },
    {
      "notification_type": "EVENT_REMINDER",
      "channel_web": true,
      "channel_push": true,
      "channel_whatsapp": false,
      "channel_email": false
    }
  ]
}
```

---

### 4.2.2 PATCH /api/notifications/preferences

Actualizar preferencias de notificación.

**Request:**
```json
{
  "notification_type": "EVENT_REMINDER",
  "channel_web": true,
  "channel_push": true,
  "channel_whatsapp": false,
  "channel_email": false
}
```

**Response:** `200 OK`
```json
{
  "preference": {
    "notification_type": "EVENT_REMINDER",
    "channel_web": true,
    "channel_push": true,
    "channel_whatsapp": false,
    "channel_email": false,
    "updatedAt": "2026-05-07T15:30:00Z"
  }
}
```

---

### 4.2.3 GET /api/notifications

Obtener notificaciones del usuario.

**Query params:**
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): resultados por página (default: 20, max: 100)
- `unread_only` (opcional): solo no leídas (true/false)

**Request:**
```
GET /api/notifications?page=1&limit=20&unread_only=true
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": 123,
      "notification_type": "POINTS_EARNED",
      "channel": "PUSH",
      "title": "🎉 Ganaste puntos!",
      "body": "Has ganado 850 puntos por tu compra",
      "status": "DELIVERED",
      "read_at": null,
      "createdAt": "2026-05-07T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  },
  "unread_count": 12
}
```

---

### 4.2.4 PATCH /api/notifications/:id/read

Marcar una notificación como leída.

**Request:**
```
PATCH /api/notifications/123/read
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "notification": {
    "id": 123,
    "status": "READ",
    "read_at": "2026-05-07T16:00:00Z"
  }
}
```

---

### 4.2.5 PATCH /api/notifications/read-all

Marcar todas las notificaciones como leídas.

**Request:**
```
PATCH /api/notifications/read-all
Headers:
  Authorization: Bearer {firebase_token}
```

**Response:** `200 OK`
```json
{
  "message": "Todas las notificaciones marcadas como leídas",
  "updated_count": 12
}
```

---

## 4.3 Validaciones Zod

**Archivo:** `src/validations/notifications.validation.ts`

```typescript
import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  body: z.object({
    notification_type: z.enum([
      'FRIEND_REQUEST',
      'FRIEND_ACCEPTED',
      'FRIEND_ACTIVITY',
      'EVENT_REMINDER',
      'EVENT_NEW',
      'EVENT_PRICE_DROP',
      'EVENT_SOLD_OUT',
      'TICKET_TRANSFER',
      'TICKET_USED',
      'POINTS_EARNED',
      'POINTS_EXPIRING',
      'POINTS_TRANSFER_SENT',
      'POINTS_TRANSFER_RECEIVED',
      'PROMOTIONAL',
      'SYSTEM'
    ]),
    channel_web: z.boolean(),
    channel_push: z.boolean(),
    channel_whatsapp: z.boolean(),
    channel_email: z.boolean()
  })
});

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    unread_only: z.enum(['true', 'false']).transform(val => val === 'true').optional()
  })
});
```

---

## 4.4 Servicio

**Archivo:** `src/services/notifications.service.ts`

```typescript
import { prisma } from '../config/database';

export class NotificationsService {
  
  /**
   * Obtener preferencias de un usuario
   */
  async getPreferences(userId: number) {
    const preferences = await prisma.notificationPreference.findMany({
      where: { user_id: userId }
    });

    // Si no existen preferencias, crear defaults
    if (preferences.length === 0) {
      const notificationTypes = [
        'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_ACTIVITY',
        'EVENT_REMINDER', 'EVENT_NEW', 'EVENT_PRICE_DROP', 'EVENT_SOLD_OUT',
        'TICKET_TRANSFER', 'TICKET_USED',
        'POINTS_EARNED', 'POINTS_EXPIRING', 'POINTS_TRANSFER_SENT', 'POINTS_TRANSFER_RECEIVED',
        'PROMOTIONAL', 'SYSTEM'
      ];

      await Promise.all(
        notificationTypes.map(type =>
          prisma.notificationPreference.create({
            data: {
              user_id: userId,
              notification_type: type as any,
              channel_web: true,
              channel_push: true,
              channel_whatsapp: false,
              channel_email: true
            }
          })
        )
      );

      return this.getPreferences(userId);
    }

    return preferences;
  }

  /**
   * Actualizar una preferencia
   */
  async updatePreference(
    userId: number,
    notificationType: string,
    channelWeb: boolean,
    channelPush: boolean,
    channelWhatsapp: boolean,
    channelEmail: boolean
  ) {
    const preference = await prisma.notificationPreference.upsert({
      where: {
        user_id_notification_type: {
          user_id: userId,
          notification_type: notificationType as any
        }
      },
      update: {
        channel_web: channelWeb,
        channel_push: channelPush,
        channel_whatsapp: channelWhatsapp,
        channel_email: channelEmail
      },
      create: {
        user_id: userId,
        notification_type: notificationType as any,
        channel_web: channelWeb,
        channel_push: channelPush,
        channel_whatsapp: channelWhatsapp,
        channel_email: channelEmail
      }
    });

    return preference;
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getNotifications(userId: number, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (unreadOnly) {
      where.read_at = null;
    }

    const [notifications, total, unread_count] = await Promise.all([
      prisma.notificationQueue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          notification_type: true,
          channel: true,
          title: true,
          body: true,
          status: true,
          read_at: true,
          createdAt: true
        }
      }),
      prisma.notificationQueue.count({ where }),
      prisma.notificationQueue.count({
        where: { user_id: userId, read_at: null }
      })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      },
      unread_count
    };
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(userId: number, notificationId: number) {
    const notification = await prisma.notificationQueue.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    const updated = await prisma.notificationQueue.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        read_at: new Date()
      }
    });

    return updated;
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: number) {
    const result = await prisma.notificationQueue.updateMany({
      where: {
        user_id: userId,
        read_at: null
      },
      data: {
        status: 'READ',
        read_at: new Date()
      }
    });

    return result.count;
  }
}
```

---

## 4.5 Controlador

**Archivo:** `src/controllers/notifications.controller.ts`

```typescript
import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

const notificationsService = new NotificationsService();

export class NotificationsController {
  
  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const preferences = await notificationsService.getPreferences(userId);
      
      res.status(200).json({ preferences });
    } catch (error: any) {
      console.error('Error in getPreferences:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch preferences'
      });
    }
  }

  async updatePreference(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { notification_type, channel_web, channel_push, channel_whatsapp, channel_email } = req.body;

      const preference = await notificationsService.updatePreference(
        userId,
        notification_type,
        channel_web,
        channel_push,
        channel_whatsapp,
        channel_email
      );
      
      res.status(200).json({ preference });
    } catch (error: any) {
      console.error('Error in updatePreference:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update preference'
      });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;
      const unreadOnly = req.query.unread_only === 'true';

      const result = await notificationsService.getNotifications(userId, page, limit, unreadOnly);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch notifications'
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const notificationId = parseInt(req.params.id);

      const notification = await notificationsService.markAsRead(userId, notificationId);
      
      res.status(200).json({ notification });
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ 
          error: 'Not found',
          message: error.message
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to mark notification as read'
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const count = await notificationsService.markAllAsRead(userId);
      
      res.status(200).json({
        message: 'Todas las notificaciones marcadas como leídas',
        updated_count: count
      });
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to mark all as read'
      });
    }
  }
}
```

---

## 4.6 Rutas

**Archivo:** `src/routes/notifications.routes.ts`

```typescript
import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRoles } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { updatePreferenceSchema, getNotificationsSchema } from '../validations/notifications.validation';

const router = Router();
const notificationsController = new NotificationsController();

// Todas las rutas requieren autenticación con rol CUSTOMER
router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

// GET /api/notifications/preferences - Obtener preferencias
router.get('/preferences', notificationsController.getPreferences.bind(notificationsController));

// PATCH /api/notifications/preferences - Actualizar preferencias
router.patch(
  '/preferences',
  validateRequest(updatePreferenceSchema),
  notificationsController.updatePreference.bind(notificationsController)
);

// GET /api/notifications - Obtener notificaciones
router.get(
  '/',
  validateRequest(getNotificationsSchema),
  notificationsController.getNotifications.bind(notificationsController)
);

// PATCH /api/notifications/:id/read - Marcar como leída
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));

// PATCH /api/notifications/read-all - Marcar todas como leídas
router.patch('/read-all', notificationsController.markAllAsRead.bind(notificationsController));

export default router;
```

**Registrar en:** `src/index.ts`

```typescript
import notificationsRoutes from './routes/notifications.routes';

// ...
app.use('/api/notifications', notificationsRoutes);
```

---

# 5. Actualización del Modelo Event

## 5.1 Nuevos campos requeridos

Agregar tres campos al modelo `Event` en Prisma:

```prisma
model Event {
  // ... campos existentes ...
  
  // Nuevos campos
  public_id   String?  @unique // UUID generado en insert, nunca se actualiza
  public_url  String?  @unique // Slug del nombre para URLs amigables
  featured    Boolean  @default(false) // Destacado en homepage
  
  // ... resto de campos ...
}
```

---

## 5.2 Reglas de negocio

| Campo | Regla |
|-------|-------|
| **public_id** | UUID v4 generado automáticamente en el `INSERT`, nunca se actualiza después |
| **public_url** | Slug del campo `name`: sin espacios (reemplazar por `-`), sin tildes, sin `ñ`, todo minúscula, único en BD |
| **public_url actualización** | Solo se actualiza cuando cambia el `name` del evento, aplicando las mismas reglas |
| **featured** | Boolean, default `false`, controlado por PAYPAC/ORGANIZER |

---

## 5.3 Función helper para slug

**Archivo:** `src/utils/slug.ts`

```typescript
/**
 * Convierte un string en un slug válido para URLs
 * - Remueve tildes y caracteres especiales
 * - Convierte espacios en guiones
 * - Todo en minúsculas
 * - Remueve caracteres no alfanuméricos excepto guiones
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Reemplazar tildes
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar ñ
    .replace(/ñ/g, 'n')
    // Reemplazar espacios por guiones
    .replace(/\s+/g, '-')
    // Remover caracteres no válidos
    .replace(/[^a-z0-9-]/g, '')
    // Remover guiones múltiples
    .replace(/-+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-|-$/g, '');
}

/**
 * Genera un slug único agregando sufijo numérico si es necesario
 */
export async function generateUniqueSlug(
  prisma: any,
  baseText: string,
  excludeEventId?: number
): Promise<string> {
  let slug = generateSlug(baseText);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await prisma.event.findFirst({
      where: {
        public_url: slug,
        ...(excludeEventId && { id: { not: excludeEventId } })
      }
    });

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${generateSlug(baseText)}-${counter}`;
      counter++;
    }
  }

  return slug;
}
```

---

## 5.4 Migración SQL

**Crear migración:** `prisma/migrations/20260507_add_event_public_fields/migration.sql`

```sql
-- Agregar campos al modelo Event
ALTER TABLE "Event" ADD COLUMN "public_id" TEXT;
ALTER TABLE "Event" ADD COLUMN "public_url" TEXT;
ALTER TABLE "Event" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- Crear índices únicos
CREATE UNIQUE INDEX "Event_public_id_key" ON "Event"("public_id");
CREATE UNIQUE INDEX "Event_public_url_key" ON "Event"("public_url");

-- Índice para búsqueda de eventos destacados
CREATE INDEX "Event_featured_idx" ON "Event"("featured");
```

**Aplicar migración:**
```bash
npx prisma db execute --url="postgresql://..." --file prisma/migrations/20260507_add_event_public_fields/migration.sql
npx prisma migrate resolve --applied 20260507_add_event_public_fields --url="postgresql://..."
npx prisma generate
```

---

## 5.5 Actualizar EventService

**Archivo:** `src/services/event.service.ts`

Modificar método `createEvent`:

```typescript
import { v4 as uuidv4 } from 'uuid';
import { generateUniqueSlug } from '../utils/slug';

// En createEvent
async createEvent(data: CreateEventData) {
  // ... validaciones existentes ...

  // Generar public_id y public_url
  const publicId = uuidv4();
  const publicUrl = await generateUniqueSlug(prisma, data.name);

  const event = await prisma.event.create({
    data: {
      ...data,
      public_id: publicId,
      public_url: publicUrl,
      featured: data.featured || false
    }
  });

  return event;
}
```

Modificar método `updateEvent`:

```typescript
async updateEvent(eventId: number, data: UpdateEventData) {
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  // Si cambió el nombre, regenerar public_url
  let publicUrl = existingEvent.public_url;
  if (data.name && data.name !== existingEvent.name) {
    publicUrl = await generateUniqueSlug(prisma, data.name, eventId);
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
      public_url: publicUrl
      // public_id NO se actualiza nunca
    }
  });

  return event;
}
```

---

## 5.6 Actualizar EventRepository

**Archivo:** `src/repositories/event.repository.ts`

Agregar métodos:

```typescript
// Buscar evento por public_id
async findByPublicId(publicId: string) {
  return prisma.event.findUnique({
    where: { public_id: publicId },
    include: {
      // ... includes existentes ...
    }
  });
}

// Buscar evento por public_url (slug)
async findByPublicUrl(publicUrl: string) {
  return prisma.event.findUnique({
    where: { public_url: publicUrl },
    include: {
      // ... includes existentes ...
    }
  });
}

// Obtener eventos destacados
async getFeaturedEvents(limit: number = 10) {
  return prisma.event.findMany({
    where: {
      featured: true,
      status: { in: ['APPROVED', 'ACTIVE'] }
    },
    orderBy: { date_event: 'asc' },
    take: limit,
    include: {
      // ... includes existentes ...
    }
  });
}
```

---

## 5.7 Actualizar endpoints públicos

**En:** `src/controllers/public-events.controller.ts`

Agregar endpoint para obtener evento por slug:

```typescript
// GET /api/public/events/slug/:publicUrl
async getEventBySlug(req: Request, res: Response) {
  try {
    const { publicUrl } = req.params;
    
    const event = await eventService.getEventByPublicUrl(publicUrl);
    
    if (!event) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Evento no encontrado'
      });
    }

    // Solo eventos públicos y activos
    if (event.event_type !== 'PUBLICO' || !['APPROVED', 'ACTIVE'].includes(event.status)) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Evento no encontrado'
      });
    }

    res.status(200).json({ event });
  } catch (error: any) {
    console.error('Error in getEventBySlug:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch event'
    });
  }
}

// GET /api/public/events/featured
async getFeaturedEvents(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 50) : 10;
    
    const events = await eventService.getFeaturedEvents(limit);
    
    res.status(200).json({ events });
  } catch (error: any) {
    console.error('Error in getFeaturedEvents:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch featured events'
    });
  }
}
```

**Agregar rutas:**

```typescript
// src/routes/public-events.routes.ts

// GET /api/public/events/featured - Eventos destacados
router.get('/featured', publicEventsController.getFeaturedEvents.bind(publicEventsController));

// GET /api/public/events/slug/:publicUrl - Obtener por slug (DEBE IR ANTES de /:id)
router.get('/slug/:publicUrl', publicEventsController.getEventBySlug.bind(publicEventsController));
```

---

## 5.8 Incluir en respuestas

**Todos los servicios** (públicos y privados) deben incluir estos campos en sus respuestas:

```typescript
// Ejemplo de include en queries
const event = await prisma.event.findUnique({
  where: { id: eventId },
  select: {
    id: true,
    public_id: true,    // ← NUEVO
    public_url: true,   // ← NUEVO
    featured: true,     // ← NUEVO
    name: true,
    // ... resto de campos ...
  }
});
```

---

## 5.9 Instalar dependencia UUID

```bash
npm install uuid
npm install --save-dev @types/uuid
```

---

# 📂 Estructura de Archivos Completa

```
src/
├── config/
│   ├── constants.ts         [ACTUALIZAR: agregar POINTS_CONFIG]
│   └── database.ts
│
├── utils/
│   └── slug.ts              [NUEVO]
│
├── validations/
│   ├── points.validation.ts          [NUEVO]
│   ├── interests.validation.ts       [NUEVO]
│   ├── followers.validation.ts       [NUEVO]
│   └── notifications.validation.ts   [NUEVO]
│
├── services/
│   ├── points.service.ts             [NUEVO]
│   ├── interests.service.ts          [NUEVO]
│   ├── followers.service.ts          [NUEVO]
│   ├── notifications.service.ts      [NUEVO]
│   ├── event.service.ts              [ACTUALIZAR: public_id, public_url, featured]
│   └── invoice.service.ts            [ACTUALIZAR: integrar puntos e intereses]
│
├── controllers/
│   ├── points.controller.ts          [NUEVO]
│   ├── interests.controller.ts       [NUEVO]
│   ├── followers.controller.ts       [NUEVO]
│   ├── notifications.controller.ts   [NUEVO]
│   └── public-events.controller.ts   [ACTUALIZAR: agregar getEventBySlug, getFeaturedEvents]
│
├── routes/
│   ├── points.routes.ts              [NUEVO]
│   ├── interests.routes.ts           [NUEVO]
│   ├── followers.routes.ts           [NUEVO]
│   ├── notifications.routes.ts       [NUEVO]
│   └── public-events.routes.ts       [ACTUALIZAR: agregar rutas slug y featured]
│
├── repositories/
│   └── event.repository.ts           [ACTUALIZAR: agregar findByPublicId, findByPublicUrl, getFeaturedEvents]
│
└── index.ts                           [ACTUALIZAR: registrar todas las rutas nuevas]
```

---

# 🚀 Checklist de Implementación

## Sistema de Puntos
- [ ] Agregar `POINTS_CONFIG` a `src/config/constants.ts`
- [ ] Crear `src/validations/points.validation.ts`
- [ ] Crear `src/services/points.service.ts`
- [ ] Crear `src/controllers/points.controller.ts`
- [ ] Crear `src/routes/points.routes.ts`
- [ ] Registrar rutas en `src/index.ts`
- [ ] Integrar con invoice webhook

## Sistema de Intereses
- [ ] Crear `src/validations/interests.validation.ts`
- [ ] Crear `src/services/interests.service.ts`
- [ ] Crear `src/controllers/interests.controller.ts`
- [ ] Crear `src/routes/interests.routes.ts`
- [ ] Registrar rutas en `src/index.ts`
- [ ] Integrar con invoice webhook

## Sistema de Seguidores
- [ ] Crear `src/validations/followers.validation.ts`
- [ ] Crear `src/services/followers.service.ts`
- [ ] Crear `src/controllers/followers.controller.ts`
- [ ] Crear `src/routes/followers.routes.ts`
- [ ] Registrar rutas en `src/index.ts`

## Sistema de Notificaciones
- [ ] Crear `src/validations/notifications.validation.ts`
- [ ] Crear `src/services/notifications.service.ts`
- [ ] Crear `src/controllers/notifications.controller.ts`
- [ ] Crear `src/routes/notifications.routes.ts`
- [ ] Registrar rutas en `src/index.ts`

## Actualización Modelo Event
- [ ] Instalar uuid: `npm install uuid @types/uuid`
- [ ] Crear `src/utils/slug.ts`
- [ ] Crear migración `20260507_add_event_public_fields`
- [ ] Aplicar migración en Railway
- [ ] Actualizar `src/services/event.service.ts`
- [ ] Actualizar `src/repositories/event.repository.ts`
- [ ] Actualizar `src/controllers/public-events.controller.ts`
- [ ] Actualizar `src/routes/public-events.routes.ts`
- [ ] Verificar que todos los endpoints incluyen nuevos campos

---

# ✅ Notas Finales

1. **Todos los endpoints requieren autenticación con rol `CUSTOMER`** excepto los endpoints públicos (`/api/public/*`)

2. **Las migraciones ya están aplicadas** en Railway para puntos, intereses, seguidores y notificaciones

3. **Falta aplicar migración** de campos `public_id`, `public_url`, `featured` en modelo Event

4. **Integración con webhooks:** Los sistemas de puntos e intereses se activan automáticamente cuando un invoice pasa a estado APPROVED

5. **Sistema de notificaciones:** Usa el mismo sistema Brevo existente para emails. La cola de notificaciones se procesa asíncronamente.

6. **Testing:** Probar cada endpoint después de implementar, especialmente las transferencias de puntos (atomicidad)

---

**Fin del documento** — Todas las especificaciones están completas y listas para implementación.
