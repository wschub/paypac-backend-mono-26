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
exports.emitNotification = exports.emitTicketTransferred = exports.emitTicketValidated = exports.setupTicketSocketHandlers = exports.authenticateSocket = void 0;
const firebase_1 = require("../config/firebase");
const db_1 = require("../config/db");
const ticket_service_1 = require("../services/ticket.service");
const ticketService = new ticket_service_1.TicketService();
/**
 * Middleware de autenticación para Socket.IO
 */
const authenticateSocket = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Token no proporcionado'));
        }
        // Verificar token con Firebase
        const decodedToken = yield firebase_1.firebaseAuth.verifyIdToken(token);
        const firebaseUid = decodedToken.uid;
        // Buscar usuario en PostgreSQL
        const user = yield db_1.prisma.user.findFirst({
            where: { firebase_uid: firebaseUid },
        });
        if (!user) {
            return next(new Error('Usuario no encontrado'));
        }
        // Inyectar datos del usuario en el socket
        socket.userId = user.id;
        socket.userRole = user.role;
        socket.userEmail = user.email;
        console.log(`🔌 Usuario autenticado en Socket.IO:`, {
            id: user.id,
            email: user.email,
            role: user.role,
        });
        next();
    }
    catch (error) {
        console.error('❌ Error en autenticación Socket.IO:', error.message);
        next(new Error('Token inválido'));
    }
});
exports.authenticateSocket = authenticateSocket;
/**
 * Configurar handlers de Socket.IO para tickets
 */
const setupTicketSocketHandlers = (io) => {
    // Aplicar middleware de autenticación
    io.use(exports.authenticateSocket);
    io.on('connection', (socket) => {
        console.log(`🔌 Cliente conectado:`, {
            socketId: socket.id,
            userId: socket.userId,
            role: socket.userRole,
        });
        // ============================================
        // 🎫 VALIDACIÓN DE TICKETS
        // ============================================
        /**
         * Evento: ticket:validate
         * El STAFF escanea un QR y valida el ticket
         */
        socket.on('ticket:validate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('📨 Validando ticket:', {
                    scanner: socket.userId,
                    event: data.event_id,
                });
                // Validar ticket usando el servicio
                const result = yield ticketService.validateTicket(data.qr_token, socket.userId, socket.userRole, data.event_id, data.device_uuid, data.totp_code, // ← agregar
                data.totp_ticket_id);
                // Emitir confirmación al scanner
                socket.emit('ticket:validated', {
                    success: true,
                    ticket: result.ticket,
                    message: result.message,
                    scanner_id: result.scanner_id,
                });
                // Emitir a todos los scanners del evento (dashboard en tiempo real)
                io.to(`event:${data.event_id}`).emit('ticket:entry', {
                    ticket_id: result.ticket.id,
                    customer_name: result.ticket.ev_name,
                    locality: result.ticket.loc_name_locality,
                    scanned_by: socket.userId,
                    scanned_at: new Date(),
                });
                console.log('✅ Ticket validado exitosamente:', result.ticket.reference_ticket);
            }
            catch (error) {
                console.error('❌ Error al validar ticket:', error.message);
                socket.emit('ticket:error', {
                    success: false,
                    message: error.message,
                    code: 'VALIDATION_ERROR',
                });
            }
        }));
        /**
         * Evento: staff:join-event
         * El STAFF se une al room del evento para recibir notificaciones en tiempo real
         */
        socket.on('staff:join-event', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Verificar que el STAFF tenga permisos para este evento
                const { EventStaffAssignmentService } = yield Promise.resolve().then(() => __importStar(require('../services/event_staff_assignment.service')));
                const staffService = new EventStaffAssignmentService();
                const canValidate = yield staffService.canStaffValidateTickets(socket.userId, data.event_id);
                if (!canValidate && socket.userRole !== 'PAYPAC') {
                    socket.emit('staff:error', {
                        message: 'No tienes permisos para este evento',
                    });
                    return;
                }
                // Unir al room del evento
                socket.join(`event:${data.event_id}`);
                socket.emit('staff:joined', {
                    event_id: data.event_id,
                    message: 'Conectado al evento exitosamente',
                });
                console.log(`🎫 STAFF ${socket.userId} unido al evento ${data.event_id}`);
            }
            catch (error) {
                socket.emit('staff:error', {
                    message: error.message,
                });
            }
        }));
        /**
         * Evento: staff:leave-event
         * El STAFF sale del room del evento
         */
        socket.on('staff:leave-event', (data) => {
            socket.leave(`event:${data.event_id}`);
            console.log(`🎫 STAFF ${socket.userId} salió del evento ${data.event_id}`);
        });
        // ============================================
        // 🔄 TRANSFERENCIAS DE TICKETS
        // ============================================
        /**
         * Evento: ticket:transfer
         * Notificar al receptor de una transferencia de ticket
         */
        socket.on('ticket:transfer', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Emitir al receptor específico
                io.to(`user:${data.to_user_id}`).emit('ticket:received', {
                    from_user_id: socket.userId,
                    ticket_id: data.ticket_id,
                    transaction_type: data.transaction_type,
                    message: data.message,
                    timestamp: new Date(),
                });
                // Confirmar al remitente
                socket.emit('ticket:transfer-sent', {
                    success: true,
                    message: 'Transferencia enviada exitosamente',
                });
                console.log(`🔄 Ticket ${data.ticket_id} transferido de ${socket.userId} a ${data.to_user_id}`);
            }
            catch (error) {
                socket.emit('ticket:error', {
                    message: error.message,
                });
            }
        }));
        /**
         * Evento: user:join
         * Usuario se une a su room personal para recibir notificaciones
         */
        socket.on('user:join', () => {
            socket.join(`user:${socket.userId}`);
            console.log(`👤 Usuario ${socket.userId} unido a su room personal`);
        });
        // ============================================
        // 🔔 NOTIFICACIONES GENERALES
        // ============================================
        /**
         * Evento: notification:send
         * Enviar notificación a un usuario específico
         */
        socket.on('notification:send', (data) => {
            io.to(`user:${data.to_user_id}`).emit('notification:received', {
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
                timestamp: new Date(),
            });
            console.log(`🔔 Notificación enviada a usuario ${data.to_user_id}`);
        });
        // Generar challenge NFC
        socket.on('nfc:challenge:request', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield ticketService.generateNFCChallenge(socket.userId, data.event_id);
                socket.emit('nfc:challenge:ready', result);
            }
            catch (error) {
                socket.emit('nfc:error', { message: error.message });
            }
        }));
        // Validar ticket NFC
        socket.on('nfc:validate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield ticketService.validateNFCTicket(data.ticket_id, data.challenge_id, data.signature, socket.userId, socket.userRole, data.event_id);
                socket.emit('ticket:validated', {
                    success: true,
                    ticket: result.ticket,
                    method: 'NFC',
                    message: result.message,
                });
                io.to(`event:${data.event_id}`).emit('ticket:entry', {
                    ticket_id: result.ticket.id,
                    locality: result.ticket.loc_name_locality,
                    scanned_by: socket.userId,
                    method: 'NFC',
                    scanned_at: new Date(),
                });
            }
            catch (error) {
                socket.emit('nfc:error', { message: error.message });
            }
        }));
        // ============================================
        // ❌ DESCONEXIÓN
        // ============================================
        socket.on('disconnect', () => {
            console.log(`❌ Cliente desconectado:`, {
                socketId: socket.id,
                userId: socket.userId,
            });
        });
    });
};
exports.setupTicketSocketHandlers = setupTicketSocketHandlers;
/**
 * Función helper para emitir eventos desde servicios
 * Ejemplo de uso:
 *
 * import { emitTicketValidated } from '../sockets/ticket.socket';
 *
 * emitTicketValidated(io, eventId, ticketData);
 */
const emitTicketValidated = (io, eventId, ticketData) => {
    io.to(`event:${eventId}`).emit('ticket:entry', ticketData);
};
exports.emitTicketValidated = emitTicketValidated;
const emitTicketTransferred = (io, toUserId, transferData) => {
    io.to(`user:${toUserId}`).emit('ticket:received', transferData);
};
exports.emitTicketTransferred = emitTicketTransferred;
const emitNotification = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification:received', notification);
};
exports.emitNotification = emitNotification;
