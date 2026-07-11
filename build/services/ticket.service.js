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
exports.TicketService = void 0;
const ticket_repository_1 = require("../repositories/ticket.repository");
const event_staff_assignment_repository_1 = require("../repositories/event_staff_assignment.repository");
const event_repository_1 = require("../repositories/event.repository");
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const ticket_utils_1 = require("../utils/ticket.utils");
const ticketRepo = new ticket_repository_1.TicketRepository();
const staffAssignmentRepo = new event_staff_assignment_repository_1.EventStaffAssignmentRepository();
const eventRepo = new event_repository_1.EventRepository();
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
// Mapa en memoria para challenges activos — TTL 15s
// En producción futura usar Redis
const nfcChallenges = new Map();
class TicketService {
    registerPublicKey(id, userId, devicePublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(id);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            if (ticket.customer_id !== userId)
                throw new Error('No autorizado');
            return ticketRepo.update(id, { device_public_key: devicePublicKey });
        });
    }
    getTotpSecret(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(id);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            if (ticket.customer_id !== userId)
                throw new Error('No autorizado');
            if (!ticket.totp_secret)
                throw new Error('TOTP no configurado para este ticket');
            return { totp_secret: ticket.totp_secret };
        });
    }
    /**
     * Crear tickets después de una compra exitosa
     * Se llama desde el webhook de pago o después de confirmar la transacción
     */
    createTicketsFromInvoice(transactionId, invoiceData, eventSnapshot, customerIdPhone) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const tickets = [];
            // ✅ LOGS DE DEBUGGING
            console.log('\n🎫 CREANDO TICKETS DESDE INVOICE');
            console.log('='.repeat(80));
            console.log('📋 Transaction ID:', transactionId);
            console.log('📋 Customer ID Phone:', customerIdPhone);
            console.log('📋 Event ID:', invoiceData.event_id);
            console.log('📋 User ID:', invoiceData.user_id);
            console.log('📋 Items recibidos:', invoiceData.items.length);
            console.log('📋 Items detallados:');
            invoiceData.items.forEach((item, index) => {
                console.log(`   [${index}] ${item.locality_name} - ${item.stage_name}`);
                console.log(`       Qty: ${item.qty_tickets}`);
                console.log(`       Locality ID: ${item.locality_id}`);
                console.log(`       Stage ID: ${item.stage_id}`);
            });
            console.log('='.repeat(80) + '\n');
            // Generar tickets por cada item de la factura
            for (const item of invoiceData.items) {
                console.log(`\n🔄 Procesando item: ${item.locality_name} - ${item.stage_name}`);
                console.log(`   Locality ID: ${item.locality_id}`);
                console.log(`   Stage ID: ${item.stage_id}`);
                console.log(`   Qty tickets para este item: ${item.qty_tickets}`);
                console.log(`   Tipo de qty_tickets: ${typeof item.qty_tickets}`);
                for (let i = 0; i < item.qty_tickets; i++) {
                    console.log(`   ✅ Generando ticket ${i + 1}/${item.qty_tickets}`);
                    const ticketData = (0, ticket_utils_1.generateTicketData)(customerIdPhone);
                    console.log(`      Reference: ${ticketData.reference_ticket}`);
                    console.log(`      Booking: ${ticketData.booking_ticket}`);
                    console.log(`      Token: ${ticketData.token_ticket.substring(0, 16)}...`);
                    tickets.push({
                        transaction_id: transactionId,
                        event_id: invoiceData.event_id,
                        customer_id: invoiceData.user_id,
                        customer_uid: invoiceData.user_uid,
                        customer_ID_phone: customerIdPhone,
                        reference_ticket: ticketData.reference_ticket,
                        booking_ticket: ticketData.booking_ticket,
                        token_ticket: ticketData.token_ticket,
                        totp_secret: ticketData.totp_secret,
                        device_uuid: (_a = invoiceData.device_uuid) !== null && _a !== void 0 ? _a : null,
                        ticket_first_time: 1,
                        status_ticket: 'PAID',
                        // Snapshot del evento
                        ev_name: eventSnapshot.name,
                        ev_short_description: eventSnapshot.short_description,
                        ev_cover: eventSnapshot.cover,
                        ev_date_event: new Date(eventSnapshot.date_event),
                        ev_place_address: eventSnapshot.place_address,
                        ev_event_type: eventSnapshot.event_type,
                        ev_type_venue: eventSnapshot.type_venue,
                        ev_place_seat: '',
                        ev_organizer_id: eventSnapshot.organizer_id,
                        ev_status: eventSnapshot.status,
                        // Snapshot de localidad
                        loc_id_locality: item.locality_id,
                        loc_name_locality: item.locality_name,
                        loc_bkg_color: ((_b = item.locality_colors) === null || _b === void 0 ? void 0 : _b.bkg_color) || '#000000',
                        loc_title_color: '#FFFFFF',
                        loc_text_color: '#FFFFFF',
                        loc_title_color_location: '#FFFFFF',
                        is_consumable: (_c = item.is_consumable) !== null && _c !== void 0 ? _c : false,
                        consumable_total: ((_d = item.is_consumable) !== null && _d !== void 0 ? _d : false) ? item.price_ticket : 0,
                        vip_access: (_e = item.vip_access) !== null && _e !== void 0 ? _e : false,
                    });
                    console.log(`      ✅ Ticket ${i + 1} agregado al array`);
                }
                console.log(`   ✅ Terminado procesamiento del item (total en array: ${tickets.length})`);
            }
            // ✅ LOGS ANTES DE CREAR EN BD
            console.log('\n📊 RESUMEN ANTES DE CREAR EN BD:');
            console.log('='.repeat(80));
            console.log('📋 Total tickets generados en array:', tickets.length);
            console.log('📋 References de los tickets:');
            tickets.forEach((t, i) => {
                console.log(`   [${i}] ${t.reference_ticket} - ${t.loc_name_locality}`);
            });
            console.log('='.repeat(80) + '\n');
            // Crear todos los tickets en batch
            console.log('🔄 Llamando a ticketRepo.createMany()...\n');
            const count = yield ticketRepo.createMany(tickets);
            // ✅ LOGS DESPUÉS DE CREAR
            console.log('\n✅ RESULTADO DE createMany():');
            console.log('='.repeat(80));
            console.log('📋 Count retornado por Prisma:', count);
            console.log('📋 Tickets que se intentaron crear:', tickets.length);
            console.log('📋 ¿Coinciden?:', count === tickets.length ? '✅ SÍ' : '❌ NO');
            console.log('='.repeat(80) + '\n');
            return {
                count,
                message: `${count} tickets creados exitosamente`,
            };
        });
    }
    /**
     * Obtener mis tickets (Wallet)
     */
    getMyTickets(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const tickets = yield ticketRepo.findByCustomer(userId, status);
            // Group by event_id preserving ev_date_event ASC order
            const eventMap = new Map();
            for (const ticket of tickets) {
                if (!eventMap.has(ticket.event_id)) {
                    eventMap.set(ticket.event_id, {
                        event_id: ticket.event_id,
                        ev_name: ticket.ev_name,
                        ev_cover: ticket.ev_cover,
                        ev_date_event: ticket.ev_date_event,
                        ev_place_address: ticket.ev_place_address,
                        ev_event_type: ticket.ev_event_type,
                        ev_type_venue: ticket.ev_type_venue,
                        ev_status: ticket.ev_status,
                        ticket_count: 0,
                        tickets: [],
                    });
                }
                const group = eventMap.get(ticket.event_id);
                group.tickets.push(ticket);
                group.ticket_count++;
            }
            // Sort event groups by ev_date_event ASC
            const events = Array.from(eventMap.values()).sort((a, b) => a.ev_date_event.getTime() - b.ev_date_event.getTime());
            return { event_count: events.length, events };
        });
    }
    /**
     * Obtener ticket por ID
     * Solo el dueño puede verlo
     */
    getTicketById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(id);
            if (!ticket) {
                throw new Error('Ticket no encontrado');
            }
            // Verificar ownership
            if (ticket.customer_id !== userId) {
                throw new Error('No tienes permisos para ver este ticket');
            }
            return ticket;
        });
    }
    /**
     * Transferir ticket (regalo o venta)
     */
    transferTicket(ticketId, fromUserId, fromUserUid, fromUserIdPhone, toUserId, toUserUid, toUserIdPhone, transactionType, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket no encontrado');
            }
            // Verificar ownership
            if (ticket.customer_id !== fromUserId) {
                throw new Error('Solo el dueño puede transferir este ticket');
            }
            // Verificar que el ticket esté disponible para transferencia
            if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
                throw new Error(`No se puede transferir un ticket con status: ${ticket.status_ticket}`);
            }
            // Verificar que no esté usado
            if (ticket.ticket_first_time === 0) {
                throw new Error('Este ticket ya fue usado y no puede transferirse');
            }
            // Regenerar token con el nuevo dueño
            const newToken = (0, ticket_utils_1.regenerateTokenOnTransfer)(ticket.reference_ticket, ticket.booking_ticket, toUserIdPhone);
            // Actualizar el ticket con el nuevo dueño
            const updatedTicket = yield ticketRepo.transferOwnership(ticketId, toUserId, toUserUid, toUserIdPhone, newToken);
            // ✅ AGREGAR — limpiar credenciales del dueño anterior
            yield ticketRepo.update(ticketId, {
                device_public_key: null,
                device_uuid: null, // también limpiar uuid anterior
                totp_secret: (0, ticket_utils_1.generateTotpSecret)(), // nuevo secreto para el nuevo dueño
            });
            return {
                ticket: updatedTicket,
                message: 'Ticket transferido exitosamente',
            };
        });
    }
    /**
     * Validar ticket en la entrada del evento
     */
    validateTicket(qrToken, scannerUserId, scannerRole, eventId, deviceUuid, totpCode, // ← agregar
    totpTicketId // ← agregar
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            let ticket;
            // ── Detectar método de validación ──────────────────────────────
            if (totpCode && totpTicketId) {
                // Método 3 — TOTP
                ticket = yield ticketRepo.findById(totpTicketId);
                if (!ticket)
                    throw new Error('Ticket no encontrado');
                if (!ticket.totp_secret) {
                    throw new Error('Este ticket no tiene TOTP configurado');
                }
                if (!(0, ticket_utils_1.validateTOTPCode)(totpCode, ticket.totp_secret)) {
                    throw new Error('Código TOTP inválido o expirado');
                }
            }
            else {
                // Método 1 y 2 — token básico o con device_uuid
                ticket = yield ticketRepo.findByToken(qrToken);
                if (!ticket)
                    throw new Error('Ticket no encontrado o token inválido');
                const isValid = (0, ticket_utils_1.validateTicketToken)(qrToken, {
                    reference_ticket: ticket.reference_ticket,
                    booking_ticket: ticket.booking_ticket,
                    customer_ID_phone: ticket.customer_ID_phone,
                });
                if (!isValid)
                    throw new Error('Token de ticket inválido');
                if (ticket.device_uuid && deviceUuid) {
                    if (ticket.device_uuid !== deviceUuid) {
                        throw new Error('El QR no proviene del dispositivo registrado. Posible fraude.');
                    }
                }
            }
            // Validar que el ticket pertenece al evento correcto
            if (ticket.event_id !== eventId) {
                throw new Error('Este ticket no pertenece a este evento');
            }
            // Verificar permisos del scanner
            if (['STAFF', 'STAFF_PROMOTER'].includes(scannerRole)) {
                const assignment = yield staffAssignmentRepo.findByUserAndEvent(scannerUserId, eventId);
                if (!assignment) {
                    throw new Error('No estás asignado a este evento');
                }
                if (!assignment.checked_in) {
                    throw new Error('Debes hacer check-in en el evento antes de validar tickets');
                }
            }
            else if (scannerRole === 'ORGANIZER') {
                const event = yield eventRepo.findById(eventId);
                if (!event || event.organizer_id !== scannerUserId) {
                    throw new Error('Solo el organizador de este evento puede validar tickets');
                }
            }
            else if (scannerRole !== 'PAYPAC') {
                throw new Error('No tienes permisos para validar tickets');
            }
            // Verificar que el evento ya haya iniciado
            const now = new Date();
            // Buscar fechas de check-in desde el evento real en BD
            const event = yield eventRepo.findById(ticket.event_id);
            if (!event)
                throw new Error('Evento no encontrado');
            if (event.date_checkin_open && now < new Date(event.date_checkin_open)) {
                throw new Error(`El check-in abre el ${new Date(event.date_checkin_open).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
            }
            if (event.date_checkin_close && now > new Date(event.date_checkin_close)) {
                throw new Error('La ventana de check-in ha cerrado');
            }
            // Validar ventana horaria de la localidad (los tickets consumibles la ignoran)
            if (!ticket.is_consumable) {
                const locality = yield localitiesRepo.findById(ticket.loc_id_locality);
                if ((locality === null || locality === void 0 ? void 0 : locality.entry_time_open) && now < new Date(locality.entry_time_open)) {
                    throw new Error(`La entrada para esta localidad abre a las ${new Date(locality.entry_time_open).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
                }
                if ((locality === null || locality === void 0 ? void 0 : locality.entry_time_close) && now > new Date(locality.entry_time_close)) {
                    throw new Error('La ventana de entrada para esta localidad ha cerrado');
                }
            }
            // Verificar que no esté ya usado
            if (ticket.ticket_first_time === 0) {
                throw new Error('Este ticket ya fue usado');
            }
            // Verificar status del ticket
            if (!['PAID', 'ACTIVE', 'TRANSFERRED'].includes(ticket.status_ticket)) {
                throw new Error(`Este ticket no es válido. Status: ${ticket.status_ticket}`);
            }
            // Marcar ticket como usado
            const validatedTicket = yield ticketRepo.markAsUsed(ticket.id);
            return {
                valid: true,
                ticket: validatedTicket,
                scanner_id: scannerUserId,
                scanner_role: scannerRole,
                message: '¡Ticket validado exitosamente! Bienvenido al evento.',
            };
        });
    }
    /**
     * Obtener tickets próximos
     */
    getUpcomingTickets(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, daysAhead = 7) {
            return ticketRepo.findUpcoming(userId, daysAhead);
        });
    }
    /**
     * Cancelar ticket
     */
    cancelTicket(ticketId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket no encontrado');
            }
            const isOwner = ticket.customer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para cancelar este ticket');
            }
            if (ticket.ticket_first_time === 0) {
                throw new Error('No se puede cancelar un ticket ya usado');
            }
            return ticketRepo.softDelete(ticketId);
        });
    }
    /**
     * Obtener estadísticas de tickets por evento
     */
    getEventTicketStats(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const tickets = yield ticketRepo.findByEvent(eventId);
            const stats = {
                total: tickets.length,
                byStatus: {
                    PAID: tickets.filter(t => t.status_ticket === 'PAID').length,
                    ACTIVE: tickets.filter(t => t.status_ticket === 'ACTIVE').length,
                    USED: tickets.filter(t => t.status_ticket === 'USED').length,
                    TRANSFERRED: tickets.filter(t => t.status_ticket === 'TRANSFERRED').length,
                    CANCELED: tickets.filter(t => t.status_ticket === 'CANCELED').length,
                },
                used: tickets.filter(t => t.ticket_first_time === 0).length,
                unused: tickets.filter(t => t.ticket_first_time === 1).length,
            };
            return stats;
        });
    }
    //NFC 
    // ── Nuevo método: generar challenge NFC ──────────────────────────
    generateNFCChallenge(staffUserId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el staff está asignado al evento
            const assignment = yield staffAssignmentRepo.findByUserAndEvent(staffUserId, eventId);
            if (!assignment)
                throw new Error('No estás asignado a este evento');
            if (!assignment.checked_in)
                throw new Error('Debes hacer check-in antes de validar');
            const challengeId = crypto.randomUUID();
            const challengeValue = (0, ticket_utils_1.generateNFCChallenge)();
            const expiresAt = Date.now() + 15000; // 15 segundos
            nfcChallenges.set(challengeId, { value: challengeValue, expiresAt });
            // Limpiar el challenge después de 15s automáticamente
            setTimeout(() => nfcChallenges.delete(challengeId), 15000);
            return { challenge_id: challengeId, challenge_value: challengeValue, expires_at: expiresAt };
        });
    }
    // ── Nuevo método: validar ticket por NFC ─────────────────────────
    validateNFCTicket(ticketId, challengeId, signature, scannerUserId, scannerRole, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Verificar challenge existe y no expiró
            const challenge = nfcChallenges.get(challengeId);
            if (!challenge)
                throw new Error('Challenge NFC no encontrado o expirado');
            if (Date.now() > challenge.expiresAt) {
                nfcChallenges.delete(challengeId);
                throw new Error('Challenge NFC expirado. Inicia el proceso nuevamente.');
            }
            // 2. Buscar ticket
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            if (!ticket.device_public_key)
                throw new Error('Este ticket no tiene clave pública registrada');
            // 3. Verificar firma RSA
            const isValid = (0, ticket_utils_1.verifyRSASignature)(challenge.value, signature, ticket.device_public_key);
            if (!isValid)
                throw new Error('Firma NFC inválida. Posible fraude.');
            // 4. Eliminar challenge usado (anti-replay)
            nfcChallenges.delete(challengeId);
            // 5. Verificar que pertenece al evento
            if (ticket.event_id !== eventId)
                throw new Error('Este ticket no pertenece a este evento');
            // 6. Verificar permisos del scanner
            if (['STAFF', 'STAFF_PROMOTER'].includes(scannerRole)) {
                const assignment = yield staffAssignmentRepo.findByUserAndEvent(scannerUserId, eventId);
                if (!assignment)
                    throw new Error('No estás asignado a este evento');
                if (!assignment.checked_in)
                    throw new Error('Debes hacer check-in antes de validar');
            }
            else if (scannerRole === 'ORGANIZER') {
                const event = yield eventRepo.findById(eventId);
                if (!event || event.organizer_id !== scannerUserId)
                    throw new Error('Solo el organizador puede validar tickets');
            }
            else if (scannerRole !== 'PAYPAC') {
                throw new Error('No tienes permisos para validar tickets');
            }
            // 7. Verificar ventana de check-in
            const now = new Date();
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            if (event.date_checkin_open && now < new Date(event.date_checkin_open))
                throw new Error(`El check-in abre el ${new Date(event.date_checkin_open).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
            if (event.date_checkin_close && now > new Date(event.date_checkin_close))
                throw new Error('La ventana de check-in ha cerrado');
            // 8. Verificar que no esté ya usado
            if (ticket.ticket_first_time === 0)
                throw new Error('Este ticket ya fue usado');
            if (!['PAID', 'ACTIVE', 'TRANSFERRED'].includes(ticket.status_ticket))
                throw new Error(`Este ticket no es válido. Status: ${ticket.status_ticket}`);
            // 9. Marcar como usado
            const validatedTicket = yield ticketRepo.markAsUsed(ticket.id);
            return {
                valid: true,
                ticket: validatedTicket,
                scanner_id: scannerUserId,
                scanner_role: scannerRole,
                method: 'NFC',
                message: '¡Ticket NFC validado exitosamente! Bienvenido al evento.',
            };
        });
    }
}
exports.TicketService = TicketService;
