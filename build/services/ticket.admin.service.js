"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketAdminService = void 0;
const ticket_admin_repository_1 = require("../repositories/ticket.admin.repository");
const ticket_repository_1 = require("../repositories/ticket.repository");
const db_1 = require("../config/db");
const crypto_1 = __importDefault(require("crypto"));
const ticketAdminRepo = new ticket_admin_repository_1.TicketAdminRepository();
const ticketRepo = new ticket_repository_1.TicketRepository();
const VALID_STATUSES = [
    'PENDING', 'PAID', 'ACTIVE', 'USED',
    'FROZEN', 'TRANSFERRED', 'CANCELED', 'EXPIRED', 'ON_SALE',
];
class TicketAdminService {
    getTickets(filters, userRole, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
                throw new Error('No tienes permisos para ver esta información');
            const parsed = {
                event_id: filters.event_id,
                status: filters.status,
                search: filters.search,
                from: filters.from ? new Date(filters.from) : undefined,
                to: filters.to ? new Date(filters.to) : undefined,
                page: (_a = filters.page) !== null && _a !== void 0 ? _a : 1,
                limit: Math.min((_b = filters.limit) !== null && _b !== void 0 ? _b : 50, 100),
                organizer_id: userRole === 'ORGANIZER' ? userId : undefined,
            };
            return ticketAdminRepo.findAll(parsed);
        });
    }
    updateTicketStatus(id, status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede cambiar el status de un ticket');
            if (!VALID_STATUSES.includes(status))
                throw new Error(`Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);
            const ticket = yield ticketRepo.findById(id);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            return ticketRepo.updateStatus(id, status);
        });
    }
    adminTransferTicket(id, toUserId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede transferir tickets administrativamente');
            const ticket = yield ticketRepo.findById(id);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            // Verificar que el receptor existe
            const toUser = yield db_1.prisma.user.findUnique({
                where: { id: toUserId },
                select: {
                    id: true,
                    name: true,
                    last_name: true,
                    email: true,
                    phone_number: true,
                    firebase_uid: true,
                },
            });
            if (!toUser)
                throw new Error('Usuario receptor no encontrado');
            // Generar nuevo token para el ticket
            const newToken = crypto_1.default.randomBytes(32).toString('hex');
            return ticketRepo.transferOwnership(id, toUser.id, (_a = toUser.firebase_uid) !== null && _a !== void 0 ? _a : '', (_b = toUser.phone_number) !== null && _b !== void 0 ? _b : '', newToken);
        });
    }
}
exports.TicketAdminService = TicketAdminService;
