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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketAdminRepository = void 0;
const db_1 = require("../config/db");
class TicketAdminRepository {
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const page = (_a = filters.page) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = filters.limit) !== null && _b !== void 0 ? _b : 50;
            const skip = (page - 1) * limit;
            const where = {};
            // Filtro por evento específico
            if (filters.event_id) {
                where.event_id = filters.event_id;
            }
            // ORGANIZER: solo sus eventos
            if (filters.organizer_id) {
                const eventIds = (yield db_1.prisma.event.findMany({
                    where: { organizer_id: filters.organizer_id },
                    select: { id: true },
                })).map(e => e.id);
                where.event_id = filters.event_id
                    ? (eventIds.includes(filters.event_id) ? filters.event_id : -1)
                    : { in: eventIds };
            }
            // Filtro por status
            if (filters.status) {
                where.status_ticket = filters.status;
            }
            // Filtro por fecha de compra
            if (filters.from || filters.to) {
                where.created_at = Object.assign(Object.assign({}, (filters.from && { gte: filters.from })), (filters.to && { lte: filters.to }));
            }
            // Búsqueda por email, nombre, num_invoice, reference_ticket
            if (filters.search) {
                const search = filters.search.trim();
                where.OR = [
                    { reference_ticket: { contains: search, mode: 'insensitive' } },
                    { booking_ticket: { contains: search, mode: 'insensitive' } },
                    { customer: { email: { contains: search, mode: 'insensitive' } } },
                    { customer: { name: { contains: search, mode: 'insensitive' } } },
                    { customer: { last_name: { contains: search, mode: 'insensitive' } } },
                    { customer: { phone_number: { contains: search, mode: 'insensitive' } } },
                ];
            }
            const [tickets, total] = yield Promise.all([
                db_1.prisma.ticket.findMany({
                    where,
                    select: {
                        id: true,
                        reference_ticket: true,
                        booking_ticket: true,
                        status_ticket: true,
                        loc_name_locality: true,
                        created_at: true,
                        ev_name: true,
                        ev_cover: true,
                        ev_date_event: true,
                        ev_place_address: true,
                        loc_bkg_color: true,
                        loc_title_color: true,
                        // Precio desde InvoiceTickets via transaction_id
                        transaction_id: true,
                        event: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                cover: true,
                                date_event: true,
                                place_address: true,
                                city: true,
                            },
                        },
                        customer: {
                            select: {
                                id: true,
                                name: true,
                                last_name: true,
                                email: true,
                                phone_number: true,
                            },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                    skip,
                    take: limit,
                }),
                db_1.prisma.ticket.count({ where }),
            ]);
            // Enriquecer con num_invoice y precio desde Invoice
            const enriched = yield Promise.all(tickets.map((ticket) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const invoice = yield db_1.prisma.invoice.findFirst({
                    where: {
                        event_id: ticket.event.id,
                        user_id: ticket.customer.id,
                        status: 'PAID',
                    },
                    select: {
                        num_invoice: true,
                        total: true,
                        total_ticket_regular: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                });
                return {
                    id: ticket.id,
                    reference_ticket: ticket.reference_ticket,
                    booking_ticket: ticket.booking_ticket,
                    status: ticket.status_ticket,
                    // Evento
                    event: {
                        id: ticket.event.id,
                        name: ticket.event.name,
                        image: ticket.event.image,
                        cover: ticket.event.cover,
                        date_event: ticket.event.date_event,
                        place_address: ticket.event.place_address,
                        city: ticket.event.city,
                    },
                    // Localidad
                    locality: {
                        name: ticket.loc_name_locality,
                        bkg_color: ticket.loc_bkg_color,
                        title_color: ticket.loc_title_color,
                    },
                    // Comprador
                    customer: {
                        id: ticket.customer.id,
                        name: ticket.customer.name,
                        last_name: ticket.customer.last_name,
                        email: ticket.customer.email,
                        phone_number: ticket.customer.phone_number,
                    },
                    // Factura
                    num_invoice: (_a = invoice === null || invoice === void 0 ? void 0 : invoice.num_invoice) !== null && _a !== void 0 ? _a : null,
                    price: (_b = invoice === null || invoice === void 0 ? void 0 : invoice.total) !== null && _b !== void 0 ? _b : null,
                    purchase_date: (_c = invoice === null || invoice === void 0 ? void 0 : invoice.createdAt) !== null && _c !== void 0 ? _c : ticket.created_at,
                };
            })));
            return {
                data: enriched,
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            };
        });
    }
}
exports.TicketAdminRepository = TicketAdminRepository;
