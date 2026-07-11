"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitPaymentPending = exports.emitPaymentVoided = exports.emitPaymentDeclined = exports.emitTicketsError = exports.emitTicketsCreated = exports.emitPaymentCompleted = exports.emitTransactionUpdated = exports.setupNotificationSocketHandlers = void 0;
/**
 * Configurar handlers de Socket.IO para notificaciones de pagos
 */
const setupNotificationSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 Cliente conectado a notificaciones:', socket.id);
        /**
         * Usuario se une a su room personal para recibir notificaciones
         * El cliente debe enviar: socket.emit('user:join', { user_id: 123 })
         */
        socket.on('user:join', (data) => {
            const roomName = `user:${data.user_id}`;
            socket.join(roomName);
            console.log(`👤 Usuario ${data.user_id} unido a room: ${roomName}`);
            socket.emit('user:joined', {
                user_id: data.user_id,
                room: roomName,
                message: 'Conectado a notificaciones en tiempo real',
                timestamp: new Date().toISOString(),
            });
        });
        /**
         * Usuario sale de su room personal
         */
        socket.on('user:leave', (data) => {
            const roomName = `user:${data.user_id}`;
            socket.leave(roomName);
            console.log(`👤 Usuario ${data.user_id} salió del room: ${roomName}`);
        });
        /**
         * Ping/Pong para mantener conexión viva
         */
        socket.on('ping', () => {
            socket.emit('pong', {
                timestamp: new Date().toISOString(),
            });
        });
        /**
         * Desconexión
         */
        socket.on('disconnect', () => {
            console.log('❌ Cliente desconectado:', socket.id);
        });
    });
};
exports.setupNotificationSocketHandlers = setupNotificationSocketHandlers;
/**
 * Helper functions para emitir eventos desde otros servicios
 */
/**
 * Notificar actualización de transacción
 */
const emitTransactionUpdated = (io, userId, data) => {
    io.to(`user:${userId}`).emit('transaction:updated', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`🔔 Notificación enviada a user:${userId} - Transaction Updated`);
};
exports.emitTransactionUpdated = emitTransactionUpdated;
/**NEW
 * ✅ NUEVO: Notificar que el pago/transacción ha sido completado (independiente del resultado)
 * Este evento SIEMPRE se emite al finalizar el procesamiento del webhook
 */
const emitPaymentCompleted = (io, userId, data) => {
    io.to(`user:${userId}`).emit('payment:completed', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`✅ Notificación payment:completed enviada a user:${userId}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Can continue: ${data.can_continue}`);
};
exports.emitPaymentCompleted = emitPaymentCompleted;
/**
 * Notificar tickets creados
 */
const emitTicketsCreated = (io, userId, data) => {
    io.to(`user:${userId}`).emit('tickets:created', Object.assign(Object.assign({}, data), { message: '¡Tus tickets han sido generados exitosamente!', timestamp: new Date().toISOString() }));
    console.log(`🎫 Notificación enviada a user:${userId} - Tickets Created (${data.ticket_count} tickets)`);
};
exports.emitTicketsCreated = emitTicketsCreated;
/**
 * Notificar error al crear tickets
 */
const emitTicketsError = (io, userId, data) => {
    io.to(`user:${userId}`).emit('tickets:error', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`❌ Notificación de error enviada a user:${userId}`);
};
exports.emitTicketsError = emitTicketsError;
/**
 * Notificar pago rechazado
 */
const emitPaymentDeclined = (io, userId, data) => {
    io.to(`user:${userId}`).emit('payment:declined', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`❌ Notificación enviada a user:${userId} - Payment Declined`);
};
exports.emitPaymentDeclined = emitPaymentDeclined;
/**
 * Notificar pago anulado
 */
const emitPaymentVoided = (io, userId, data) => {
    io.to(`user:${userId}`).emit('payment:voided', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`❌ Notificación enviada a user:${userId} - Payment Voided`);
};
exports.emitPaymentVoided = emitPaymentVoided;
/**
 * Notificar pago pendiente
 */
const emitPaymentPending = (io, userId, data) => {
    io.to(`user:${userId}`).emit('payment:pending', Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() }));
    console.log(`⏳ Notificación enviada a user:${userId} - Payment Pending`);
};
exports.emitPaymentPending = emitPaymentPending;
