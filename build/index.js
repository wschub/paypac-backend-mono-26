"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = void 0;
require("./env"); // must be first — loads .env before any other module reads process.env
const express_1 = __importDefault(require("express"));
//import "./types/express";
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const event_liquidation_routes_1 = __importDefault(require("./routes/event_liquidation.routes"));
const section_routes_1 = __importDefault(require("./routes/section.routes"));
const role_section_permission_routes_1 = __importDefault(require("./routes/role_section_permission.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const subcategory_routes_1 = __importDefault(require("./routes/subcategory.routes"));
const subgenre_routes_1 = __importDefault(require("./routes/subgenre.routes"));
const generalsettings_routes_1 = __importDefault(require("./routes/generalsettings.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const eventlocalities_routes_1 = __importDefault(require("./routes/eventlocalities.routes"));
const eventstages_routes_1 = __importDefault(require("./routes/eventstages.routes"));
const event_places_routes_1 = __importDefault(require("./routes/event_places.routes"));
const event_place_zone_routes_1 = __importDefault(require("./routes/event_place_zone.routes"));
const event_place_row_routes_1 = __importDefault(require("./routes/event_place_row.routes"));
const event_place_seat_routes_1 = __importDefault(require("./routes/event_place_seat.routes"));
const event_seat_status_routes_1 = __importDefault(require("./routes/event_seat_status.routes"));
const eventdcto_routes_1 = __importDefault(require("./routes/eventdcto.routes"));
const eventrewardrules_routes_1 = __importDefault(require("./routes/eventrewardrules.routes"));
const eventbalancepromoters_routes_1 = __importDefault(require("./routes/eventbalancepromoters.routes"));
const promoter_code_routes_1 = __importDefault(require("./routes/promoter_code.routes"));
const eventfavorites_routes_1 = __importDefault(require("./routes/eventfavorites.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const tickettransaction_routes_1 = __importDefault(require("./routes/tickettransaction.routes"));
const event_staff_assignment_routes_1 = __importDefault(require("./routes/event_staff_assignment.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const paymentmethodsui_routes_1 = __importDefault(require("./routes/paymentmethodsui.routes"));
const paymentmethodcard_routes_1 = __importDefault(require("./routes/paymentmethodcard.routes"));
const notificationmessagequeue_routes_1 = __importDefault(require("./routes/notificationmessagequeue.routes"));
const sms_routes_1 = __importDefault(require("./routes/sms.routes"));
const countries_routes_1 = __importDefault(require("./routes/countries.routes"));
const states_routes_1 = __importDefault(require("./routes/states.routes"));
const cities_routes_1 = __importDefault(require("./routes/cities.routes"));
const company_followers_routes_1 = __importDefault(require("./routes/company_followers.routes"));
const public_1 = __importDefault(require("./routes/public"));
const points_routes_1 = __importDefault(require("./routes/points.routes"));
const interests_routes_1 = __importDefault(require("./routes/interests.routes"));
const followers_routes_1 = __importDefault(require("./routes/followers.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const event_waiting_list_routes_1 = __importDefault(require("./routes/event_waiting_list.routes"));
const ticket_sale_routes_1 = __importDefault(require("./routes/ticket_sale.routes"));
const event_private_guest_routes_1 = __importDefault(require("./routes/event_private_guest.routes"));
const promoter_request_routes_1 = __importDefault(require("./routes/promoter_request.routes"));
const web_sections_routes_1 = __importDefault(require("./routes/web_sections.routes"));
const brevo_1 = require("./config/brevo");
const email_queue_processor_1 = require("./jobs/email-queue-processor");
const event_finalizer_1 = require("./jobs/event-finalizer");
const ticket_transfer_expiry_1 = require("./jobs/ticket-transfer-expiry");
//webkook routes
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const fcm_token_routes_1 = __importDefault(require("./routes/fcm-token.routes"));
const onurix_1 = require("./config/onurix");
//upload files
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
// Validar solo si las credenciales están configuradas
try {
    (0, onurix_1.validateOnurixConfig)();
}
catch (error) {
    console.warn('⚠️ Advertencia Onurix:', error.message);
    console.warn('⚠️ El módulo de SMS 2FA no estará disponible');
}
// Validar configuración de Brevo al iniciar
(0, brevo_1.validateBrevoConfig)();
// Validar configuración de Onurix al iniciar
(0, onurix_1.validateOnurixConfig)();
// ============================================
// 🔌 SOCKET.IO HANDLERS
// ============================================
const ticket_socket_1 = require("./sockets/ticket.socket");
const notification_socket_1 = require("./sockets/notification.socket");
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (Railway)
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:4000",
            "https://paypac-backend-mono-26-production.up.railway.app",
            "https://paypac.co",
            "https://api.paypac.co",
            "https://app.paypac.co",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true
    }
});
exports.io = io;
const port = Number(process.env.PORT) || 5000;
const host = '0.0.0.0';
//app.options('*', cors());
// middlewares
app.use((0, cors_1.default)({
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
        }
        else {
            console.log("⛔ Bloqueado por CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Web-API-Key"],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/liquidations', event_liquidation_routes_1.default);
app.use('/api/sections', section_routes_1.default);
app.use('/api/permissions', role_section_permission_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/subcategories', subcategory_routes_1.default);
app.use('/api/subgenres', subgenre_routes_1.default);
app.use('/api/settings', generalsettings_routes_1.default);
app.use('/api/companies', company_routes_1.default);
app.use('/api/countries', countries_routes_1.default);
app.use('/api/states', states_routes_1.default);
app.use('/api/cities', cities_routes_1.default);
app.use('/api/companies', company_followers_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api', eventlocalities_routes_1.default);
app.use('/api', eventstages_routes_1.default);
app.use('/api/venues', event_places_routes_1.default);
app.use('/api/venues/zones', event_place_zone_routes_1.default);
app.use('/api/venues/rows', event_place_row_routes_1.default);
app.use('/api/venues/seats', event_place_seat_routes_1.default);
app.use('/api/venues/seat-status', event_seat_status_routes_1.default);
app.use('/api', eventdcto_routes_1.default);
app.use('/api', eventrewardrules_routes_1.default);
app.use('/api', eventbalancepromoters_routes_1.default);
app.use('/api/promoter-codes', promoter_code_routes_1.default);
app.use('/api', eventfavorites_routes_1.default);
app.use('/api', invoice_routes_1.default); // Rutas de facturas
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/ticket-transactions', tickettransaction_routes_1.default);
app.use('/api/staff', event_staff_assignment_routes_1.default); // Para /api/staff/my-events
app.use('/api/events', event_staff_assignment_routes_1.default); // Para /api/events/:eventId/staff/*
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/payment-methods', paymentmethodsui_routes_1.default);
app.use('/api/payment-cards', paymentmethodcard_routes_1.default);
//notification routes
app.use('/api/email-queue', notificationmessagequeue_routes_1.default);
//sms routes
app.use('/api/sms', sms_routes_1.default);
app.use('/api/countries', countries_routes_1.default);
// Registrar rutas ANTES de las rutas autenticadas
app.use('/api/webhooks', webhook_routes_1.default); // Sin autenticación
// Registrar rutas de FCM token
app.use('/api/fcm-token', fcm_token_routes_1.default);
//files
app.use("/api/upload", upload_routes_1.default);
// Endpoints públicos para paypac.co (sin autenticación Firebase)
app.use('/api/public', public_1.default);
// Sistemas sociales y puntos
app.use('/api/points', points_routes_1.default);
app.use('/api/interests', interests_routes_1.default);
app.use('/api/followers', followers_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/waiting-list', event_waiting_list_routes_1.default);
app.use('/api', ticket_sale_routes_1.default);
app.use('/api/events/:eventId/guest-list', event_private_guest_routes_1.default);
app.use('/api/promoter-requests', promoter_request_routes_1.default);
app.use('/api/web-sections', web_sections_routes_1.default);
// Iniciar CRON jobs
(0, email_queue_processor_1.startEmailQueueProcessor)(); // Procesa cola cada 5 minutos
(0, email_queue_processor_1.startEmailQueueCleaner)(); // Limpia mensajes antiguos diariamente
(0, event_finalizer_1.startEventFinalizer)(); //Finalize eventos
(0, ticket_transfer_expiry_1.startTicketTransferExpiry)(); //Ticket expira en 48 horas si no es aceptado
// ============================================
// 🔌 WebSocket - Socket.IO
// ============================================
(0, ticket_socket_1.setupTicketSocketHandlers)(io);
(0, notification_socket_1.setupNotificationSocketHandlers)(io);
console.log('✅ Socket.IO configurado con handlers de tickets');
console.log('✅ Socket.IO configurado con handlers de notificaciones');
server.listen({ port, host }, () => {
    console.log(`✅ Servidor corriendo en http://${host}:${port}`);
    console.log(`🎫 Módulo de Tickets: ACTIVO`);
    console.log(`👥 Módulo de Staff Assignment: ACTIVO`);
    console.log(`🔌 Socket.IO: ACTIVO en puerto ${port}`);
});
