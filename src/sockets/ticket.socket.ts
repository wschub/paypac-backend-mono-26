import { Server as SocketIOServer, Socket } from 'socket.io';
import { firebaseAuth } from '../config/firebase';
import { prisma } from '../config/db';
import { TicketService } from '../services/ticket.service';

const ticketService = new TicketService();

/**
 * Interfaz para usuarios autenticados en Socket.IO
 */
interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  userEmail?: string;
}

/**
 * Middleware de autenticación para Socket.IO
 */
export const authenticateSocket = async (socket: AuthenticatedSocket, next: any) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    // Verificar token con Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Buscar usuario en PostgreSQL
    const user = await prisma.user.findFirst({
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
  } catch (error: any) {
    console.error('❌ Error en autenticación Socket.IO:', error.message);
    next(new Error('Token inválido'));
  }
};

/**
 * Configurar handlers de Socket.IO para tickets
 */
export const setupTicketSocketHandlers = (io: SocketIOServer) => {
  // Aplicar middleware de autenticación
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
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
    socket.on('ticket:validate', async (data: {
      qr_token: string;
      event_id: number;
      device_uuid?: string;
      latitude?: string;
      longitude?: string;
    }) => {
      try {
        console.log('📨 Validando ticket:', {
          scanner: socket.userId,
          event: data.event_id,
        });

        // Validar ticket usando el servicio
        const result = await ticketService.validateTicket(
          data.qr_token,
          socket.userId!,
          socket.userRole!,
          data.event_id,
          data.device_uuid
        );

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
      } catch (error: any) {
        console.error('❌ Error al validar ticket:', error.message);
        
        socket.emit('ticket:error', {
          success: false,
          message: error.message,
          code: 'VALIDATION_ERROR',
        });
      }
    });

    /**
     * Evento: staff:join-event
     * El STAFF se une al room del evento para recibir notificaciones en tiempo real
     */
    socket.on('staff:join-event', async (data: { event_id: number }) => {
      try {
        // Verificar que el STAFF tenga permisos para este evento
        const { EventStaffAssignmentService } = await import('../services/event_staff_assignment.service');
        const staffService = new EventStaffAssignmentService();
        
        const canValidate = await staffService.canStaffValidateTickets(
          socket.userId!,
          data.event_id
        );

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
      } catch (error: any) {
        socket.emit('staff:error', {
          message: error.message,
        });
      }
    });

    /**
     * Evento: staff:leave-event
     * El STAFF sale del room del evento
     */
    socket.on('staff:leave-event', (data: { event_id: number }) => {
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
    socket.on('ticket:transfer', async (data: {
      to_user_id: number;
      ticket_id: number;
      transaction_type: string;
      message: string;
    }) => {
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
      } catch (error: any) {
        socket.emit('ticket:error', {
          message: error.message,
        });
      }
    });

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
    socket.on('notification:send', (data: {
      to_user_id: number;
      type: string;
      title: string;
      message: string;
      data?: any;
    }) => {
      io.to(`user:${data.to_user_id}`).emit('notification:received', {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        timestamp: new Date(),
      });

      console.log(`🔔 Notificación enviada a usuario ${data.to_user_id}`);
    });

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

/**
 * Función helper para emitir eventos desde servicios
 * Ejemplo de uso:
 * 
 * import { emitTicketValidated } from '../sockets/ticket.socket';
 * 
 * emitTicketValidated(io, eventId, ticketData);
 */

export const emitTicketValidated = (io: SocketIOServer, eventId: number, ticketData: any) => {
  io.to(`event:${eventId}`).emit('ticket:entry', ticketData);
};

export const emitTicketTransferred = (io: SocketIOServer, toUserId: number, transferData: any) => {
  io.to(`user:${toUserId}`).emit('ticket:received', transferData);
};

export const emitNotification = (io: SocketIOServer, userId: number, notification: any) => {
  io.to(`user:${userId}`).emit('notification:received', notification);
};
