"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import { wompiWebhook } from '../controllers/wompi.controller';
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/webhooks/wompi
 * Webhook de Wompi para notificaciones de transacciones
 *
 * ⚠️ IMPORTANTE: Este endpoint NO debe tener autenticación
 * Wompi lo llamará directamente con su propia firma de seguridad
 *
 * La verificación de seguridad se hace dentro del controller
 * mediante la validación de la firma SHA256
 */
router.post('/wompi', webhook_controller_1.wompiWebhook);
exports.default = router;
