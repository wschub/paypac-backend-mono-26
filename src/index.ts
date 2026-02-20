import express from 'express';
//import "./types/express";
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();


import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import eventLocalitiesRoutes from './routes/eventlocalities.routes';
import eventStagesRoutes from './routes/eventstages.routes';
import eventDctoRoutes from './routes/eventdcto.routes';
import eventRewardRulesRoutes from './routes/eventrewardrules.routes';
import eventBalancePromotersRoutes from './routes/eventbalancepromoters.routes';
import eventFavoritesRoutes from './routes/eventfavorites.routes';
import  invoicesRoutes   from "./routes/invoice.routes";
import ticketRoutes from './routes/ticket.routes';
import ticketTransactionRoutes from './routes/tickettransaction.routes';
import staffAssignmentRoutes from './routes/event_staff_assignment.routes';
import transactionRoutes from './routes/transaction.routes';
import paymentMethodsUIRoutes from './routes/paymentmethodsui.routes';
import paymentCardRoutes from './routes/paymentmethodcard.routes';

import emailQueueRoutes from './routes/notificationmessagequeue.routes';
import { validateBrevoConfig } from './config/brevo';
import { startEmailQueueProcessor, startEmailQueueCleaner } from './jobs/email-queue-processor';
import smsRoutes from './routes/sms.routes';
import countriesRoutes from './routes/countries.routes';


//webkook routes
import webhookRoutes from './routes/webhook.routes';
import fcmTokenRoutes from './routes/fcm-token.routes';



import { validateOnurixConfig } from './config/onurix';

// Validar solo si las credenciales están configuradas
try {
  validateOnurixConfig();
} catch (error: any) {
  console.warn('⚠️ Advertencia Onurix:', error.message);
  console.warn('⚠️ El módulo de SMS 2FA no estará disponible');
}
// Validar configuración de Brevo al iniciar
validateBrevoConfig();
// Validar configuración de Onurix al iniciar
validateOnurixConfig();


// ============================================
// 🔌 SOCKET.IO HANDLERS
// ============================================
import { setupTicketSocketHandlers } from './sockets/ticket.socket';
import { setupNotificationSocketHandlers } from './sockets/notification.socket';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
 
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
       "https://paypac-backend-mono-26-production.up.railway.app",
       "https://paypac.com.co",
       "https://api.paypac.com.co",
        "https://app.paypac.com.co",
    ],
    methods: ["GET", "POST","PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

const port = Number(process.env.PORT) || 5000;
const host = '0.0.0.0';

//app.options('*', cors());

// middlewares
app.use(cors({
  origin: function (origin, callback) {
    console.log("🔥 Origin recibido por CORS:", origin);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://paypac-backend-mono-26-production.up.railway.app",
       "https://paypac.com.co",
       "https://api.paypac.com.co",
       "https://app.paypac.com.co",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("⛔ Bloqueado por CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// 🔥 IMPORTANTE: Health check en la raíz para Railway
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "PayPac API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
//app.use('/api/countries', countryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', eventLocalitiesRoutes);
app.use('/api', eventStagesRoutes);
app.use('/api', eventDctoRoutes);
app.use('/api', eventRewardRulesRoutes);
app.use('/api', eventBalancePromotersRoutes);
app.use('/api', eventFavoritesRoutes);
app.use('/api', invoicesRoutes); // Rutas de facturas
app.use('/api/tickets', ticketRoutes);
app.use('/api/ticket-transactions', ticketTransactionRoutes);
app.use('/api/staff', staffAssignmentRoutes); // Para /api/staff/my-events
app.use('/api/events', staffAssignmentRoutes); // Para /api/events/:eventId/staff/*
app.use('/api/transactions', transactionRoutes);
app.use('/api/payment-methods', paymentMethodsUIRoutes);
app.use('/api/payment-cards', paymentCardRoutes);
//notification routes
app.use('/api/email-queue', emailQueueRoutes);
//sms routes
app.use('/api/sms', smsRoutes);
app.use('/api/countries', countriesRoutes);

// Registrar rutas ANTES de las rutas autenticadas
app.use('/api/webhooks', webhookRoutes); // Sin autenticación
// Registrar rutas de FCM token
app.use('/api/fcm-token', fcmTokenRoutes);


// Iniciar CRON jobs
startEmailQueueProcessor(); // Procesa cola cada 5 minutos
startEmailQueueCleaner();   // Limpia mensajes antiguos diariamente


// ============================================
// 🔌 WebSocket - Socket.IO
// ============================================
setupTicketSocketHandlers(io);
setupNotificationSocketHandlers(io);

console.log('✅ Socket.IO configurado con handlers de tickets');
console.log('✅ Socket.IO configurado con handlers de notificaciones');


server.listen({ port, host }, () => {
   console.log(`✅ Servidor corriendo en http://${host}:${port}`);
  console.log(`🎫 Módulo de Tickets: ACTIVO`);
  console.log(`👥 Módulo de Staff Assignment: ACTIVO`);
  console.log(`🔌 Socket.IO: ACTIVO en puerto ${port}`);
});




// Exporta IO para usarlo en controladores
export { io, server };
