import express from 'express';
//import "./types/express";
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';



import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import eventLocalitiesRoutes from './routes/eventlocalities.routes';
import eventStagesRoutes from './routes/eventstages.routes';
import eventDctoRoutes from './routes/eventdcto.routes';
import eventRewardRulesRoutes from './routes/eventrewardrules.routes';
import eventBalancePromotersRoutes from './routes/eventbalancepromoters.routes';
import eventFavoritesRoutes from './routes/eventfavorites.routes';
import ticketRoutes from './routes/ticket.routes';
import ticketTransactionRoutes from './routes/tickettransaction.routes';




dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
 
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://sappien-frontend-mono-production.up.railway.app",
      "https://sappien-backend-mono-production.up.railway.app"
      //"https://paypac.com.co"
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
      "https://sappien-frontend-mono-production.up.railway.app",
      "https://sappien-backend-mono-production.up.railway.app"
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
app.use('/api/tickets', ticketRoutes);
app.use('/api/ticket-transactions', ticketTransactionRoutes);


// ============================================
// 🔌 WebSocket logic
// ============================================
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // 🎫 Eventos de tickets en tiempo real
  socket.on("ticket:transfer", (data) => {
    console.log("📨 Ticket transfer:", data);
    // Emitir al receptor específico
    io.to(data.to_user_socket_id).emit("ticket:received", data);
  });

  socket.on("ticket:validated", (data) => {
    console.log("✅ Ticket validated:", data);
    // Emitir a todos los scanners del evento
    io.to(`event:${data.event_id}`).emit("ticket:entry", data);
  });

  socket.on("message", (data) => {
    console.log("📨 Message received:", data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});



server.listen({ port, host }, () => {
  console.log(`✅ Servidor corriendo en http://${host}:${port}`);
  console.log(`🎫 Módulo de Tickets: ACTIVO`);
});




// Exporta IO para usarlo en controladores
export { io, server };
