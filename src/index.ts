import express from 'express';
//import "./types/express";
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

import dashboardRoutes     from './routes/dashboard.routes';
import reportsRoutes       from './routes/reports.routes';
import liquidationRoutes   from './routes/event_liquidation.routes';
import sectionRoutes from './routes/section.routes';
import permissionRoutes from './routes/role_section_permission.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import subCategoryRoutes from './routes/subcategory.routes';
import subgenreRoutes from './routes/subgenre.routes';
import settingsRoutes from './routes/generalsettings.routes';
import companyRoutes from './routes/company.routes';
import eventRoutes from './routes/event.routes';
import eventLocalitiesRoutes from './routes/eventlocalities.routes';
import eventStagesRoutes from './routes/eventstages.routes';
import eventPlacesRoutes    from './routes/event_places.routes';
import eventPlaceZoneRoutes from './routes/event_place_zone.routes';
import eventPlaceRowRoutes  from './routes/event_place_row.routes';
import eventPlaceSeatRoutes from './routes/event_place_seat.routes';
import eventSeatStatusRoutes from './routes/event_seat_status.routes';
import eventDctoRoutes from './routes/eventdcto.routes';
import eventRewardRulesRoutes from './routes/eventrewardrules.routes';
import eventBalancePromotersRoutes from './routes/eventbalancepromoters.routes';
import promoterCodeRoutes from './routes/promoter_code.routes';
import eventFavoritesRoutes from './routes/eventfavorites.routes';
import  invoicesRoutes   from "./routes/invoice.routes";
import ticketRoutes from './routes/ticket.routes';
import ticketTransactionRoutes from './routes/tickettransaction.routes';
import staffAssignmentRoutes from './routes/event_staff_assignment.routes';
import transactionRoutes from './routes/transaction.routes';
import paymentMethodsUIRoutes from './routes/paymentmethodsui.routes';
import paymentCardRoutes from './routes/paymentmethodcard.routes';
import emailQueueRoutes from './routes/notificationmessagequeue.routes';
import smsRoutes from './routes/sms.routes';
import countriesRoutes from './routes/countries.routes';
import statesRoutes from './routes/states.routes';
import citiesRoutes from './routes/cities.routes';
import companyFollowersRoutes from './routes/company_followers.routes';
import publicRouter from './routes/public';
import pointsRoutes from './routes/points.routes';
import interestsRoutes from './routes/interests.routes';
import followersRoutes from './routes/followers.routes';
import notificationsRoutes from './routes/notifications.routes';


import { validateBrevoConfig } from './config/brevo';
import { startEmailQueueProcessor, startEmailQueueCleaner } from './jobs/email-queue-processor';
import { startEventFinalizer } from './jobs/event-finalizer';
import { startTicketTransferExpiry } from './jobs/ticket-transfer-expiry';


//webkook routes
import webhookRoutes from './routes/webhook.routes';
import fcmTokenRoutes from './routes/fcm-token.routes';
import { validateOnurixConfig } from './config/onurix';

//upload files
import uploadRoutes from "./routes/upload.routes";


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
app.set('trust proxy', 1); // Trust first proxy (Railway)
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
 
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://paypac-backend-mono-26-production.up.railway.app",
       "https://paypac.co",
       "https://api.paypac.co",
       "https://app.paypac.co",
    ],
    methods: ["GET", "POST","PUT","PATCH", "DELETE", "OPTIONS"],
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
       "https://paypac.co",
       "https://api.paypac.co",
       "https://app.paypac.co",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("⛔ Bloqueado por CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Web-API-Key"],
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
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/reports',      reportsRoutes);
app.use('/api/liquidations', liquidationRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/subgenres', subgenreRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/companies', companyFollowersRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', eventLocalitiesRoutes);
app.use('/api', eventStagesRoutes);
app.use('/api/venues',             eventPlacesRoutes);
app.use('/api/venues/zones',       eventPlaceZoneRoutes);
app.use('/api/venues/rows',        eventPlaceRowRoutes);
app.use('/api/venues/seats',       eventPlaceSeatRoutes);
app.use('/api/venues/seat-status', eventSeatStatusRoutes);
app.use('/api', eventDctoRoutes);
app.use('/api', eventRewardRulesRoutes);
app.use('/api', eventBalancePromotersRoutes);
app.use('/api/promoter-codes', promoterCodeRoutes);
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

//files
app.use("/api/upload", uploadRoutes);

// Endpoints públicos para paypac.co (sin autenticación Firebase)
app.use('/api/public', publicRouter);

// Sistemas sociales y puntos
app.use('/api/points', pointsRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/followers', followersRoutes);
app.use('/api/notifications', notificationsRoutes);


// Iniciar CRON jobs
startEmailQueueProcessor(); // Procesa cola cada 5 minutos
startEmailQueueCleaner();   // Limpia mensajes antiguos diariamente
startEventFinalizer(); //Finalize eventos
startTicketTransferExpiry(); //Ticket expira en 48 horas si no es aceptado

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
