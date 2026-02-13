import { Server as SocketIOServer } from 'socket.io';

/**
 * Configurar handlers de Socket.IO para notificaciones de pagos
 */
export const setupNotificationSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado a notificaciones:', socket.id);

    /**
     * Usuario se une a su room personal para recibir notificaciones
     * El cliente debe enviar: socket.emit('user:join', { user_id: 123 })
     */
    socket.on('user:join', (data: { user_id: number }) => {
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
    socket.on('user:leave', (data: { user_id: number }) => {
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

/**
 * Helper functions para emitir eventos desde otros servicios
 */

/**
 * Notificar actualización de transacción
 */
export const emitTransactionUpdated = (
  io: SocketIOServer,
  userId: number,
  data: {
    transaction_id: number;
    invoice_id: number;
    num_invoice: string;
    status: string;
    status_message: string;
    amount: number;
  }
) => {
  io.to(`user:${userId}`).emit('transaction:updated', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`🔔 Notificación enviada a user:${userId} - Transaction Updated`);
};

/**
 * ✅ NUEVO: Notificar que el pago/transacción ha sido completado (independiente del resultado)
 * Este evento SIEMPRE se emite al finalizar el procesamiento del webhook
 */
export const emitPaymentCompleted = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    transaction_id: number;
    status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
    status_message: string;
    can_continue: boolean; // true = puede navegar, false = esperar más
  }
) => {
  io.to(`user:${userId}`).emit('payment:completed', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`✅ Notificación payment:completed enviada a user:${userId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Can continue: ${data.can_continue}`);
};

/**
 * Notificar tickets creados
 */
export const emitTicketsCreated = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    transaction_id: number;
    event_id: number;
    ticket_count: number;
  }
) => {
  io.to(`user:${userId}`).emit('tickets:created', {
    ...data,
    message: '¡Tus tickets han sido generados exitosamente!',
    timestamp: new Date().toISOString(),
  });
  
  console.log(`🎫 Notificación enviada a user:${userId} - Tickets Created (${data.ticket_count} tickets)`);
};

/**
 * Notificar error al crear tickets
 */
export const emitTicketsError = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    error: string;
  }
) => {
  io.to(`user:${userId}`).emit('tickets:error', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`❌ Notificación de error enviada a user:${userId}`);
};

/**
 * Notificar pago rechazado
 */
export const emitPaymentDeclined = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    status: string;
    message: string;
  }
) => {
  io.to(`user:${userId}`).emit('payment:declined', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`❌ Notificación enviada a user:${userId} - Payment Declined`);
};

/**
 * Notificar pago anulado
 */
export const emitPaymentVoided = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    message: string;
  }
) => {
  io.to(`user:${userId}`).emit('payment:voided', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`❌ Notificación enviada a user:${userId} - Payment Voided`);
};

/**
 * Notificar pago pendiente
 */
export const emitPaymentPending = (
  io: SocketIOServer,
  userId: number,
  data: {
    invoice_id: number;
    num_invoice: string;
    message: string;
  }
) => {
  io.to(`user:${userId}`).emit('payment:pending', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`⏳ Notificación enviada a user:${userId} - Payment Pending`);
};