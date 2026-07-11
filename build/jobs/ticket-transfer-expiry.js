"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTicketTransferExpiry = startTicketTransferExpiry;
const db_1 = require("../config/db");
const ticket_repository_1 = require("../repositories/ticket.repository");
const push_notification_service_1 = require("../services/push-notification.service"); // ✅ AGREGAR
const ticketRepo = new ticket_repository_1.TicketRepository();
const pushService = new push_notification_service_1.PushNotificationService(); // ✅ AGREGAR
function startTicketTransferExpiry() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⏰ [CRON] Ticket Transfer Expiry iniciado — revisión cada hora');
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('🔄 [CRON] Buscando transferencias expiradas...');
            try {
                const cutoff = new Date();
                //cutoff.setHours(cutoff.getHours() - 48); // 48 horas atrás
                cutoff.setMinutes(cutoff.getMinutes() - 5); // 5 minutos
                // Buscar transacciones PENDING donde el destinatario sigue siendo placeholder
                // (to_customer_id === from_customer_id indica que no se ha asignado receptor real)
                const expired = yield db_1.prisma.ticketTransaction.findMany({
                    where: {
                        status_ticket: 'PENDING',
                        created_at: { lte: cutoff },
                        // Destinatario sigue sin registrarse (to = from es el placeholder)
                        // O directamente llevan más de 48h pendientes
                    },
                });
                if (expired.length === 0) {
                    console.log('✅ [CRON] No hay transferencias expiradas');
                    return;
                }
                console.log(`📋 [CRON] ${expired.length} transferencia(s) expirada(s)`);
                for (const tx of expired) {
                    try {
                        // Devolver ticket al remitente
                        yield ticketRepo.transferOwnership(tx.ticket_id, tx.from_customer_id, tx.from_customer_uid, tx.from_customer_UUID_phone, tx.from_customer_token);
                        yield ticketRepo.updateStatus(tx.ticket_id, 'ACTIVE');
                        // Cancelar la transacción
                        yield db_1.prisma.ticketTransaction.update({
                            where: { id: tx.id },
                            data: { status_ticket: 'CANCELLED' },
                        });
                        console.log(`✅ [CRON] Transacción ${tx.id} expirada — ticket ${tx.ticket_id} devuelto`);
                        // ✅ Notificar al remitente vía Socket.IO
                        try {
                            const { io } = yield Promise.resolve().then(() => __importStar(require('../index')));
                            io.to(`user:${tx.from_customer_id}`).emit('ticket:transfer:expired', {
                                transaction_id: tx.id,
                                ticket_id: tx.ticket_id,
                                message: 'La transferencia expiró. Tu ticket está de vuelta en tu Wallet.',
                                timestamp: new Date().toISOString(),
                            });
                        }
                        catch (socketError) {
                            console.error('⚠️ Error Socket.IO expired:', socketError.message);
                        }
                        // ✅ AGREGAR: Notificar al remitente vía FCM push notification
                        try {
                            const sender = yield db_1.prisma.user.findUnique({
                                where: { id: tx.from_customer_id },
                                select: { fcm_token: true },
                            });
                            if (sender === null || sender === void 0 ? void 0 : sender.fcm_token) {
                                const ticket = yield db_1.prisma.ticket.findUnique({
                                    where: { id: tx.ticket_id },
                                    select: { ev_name: true },
                                });
                                yield pushService.sendTicketTransferExpiredNotification(sender.fcm_token, {
                                    eventName: (_a = ticket === null || ticket === void 0 ? void 0 : ticket.ev_name) !== null && _a !== void 0 ? _a : 'tu evento',
                                    transactionId: tx.id,
                                    ticketId: tx.ticket_id,
                                });
                            }
                        }
                        catch (fcmError) {
                            console.error('⚠️ Error FCM expired:', fcmError.message);
                        }
                    }
                    catch (txError) {
                        console.error(`❌ [CRON] Error procesando tx ${tx.id}:`, txError.message);
                    }
                }
            }
            catch (err) {
                console.error('❌ [CRON] Error en Ticket Transfer Expiry:', err.message);
            }
        }), 60 * 60 * 1000); // cada hora
    });
}
