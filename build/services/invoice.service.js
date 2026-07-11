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
exports.InvoiceService = void 0;
const invoice_repository_1 = require("../repositories/invoice.repository");
const invoicetickets_repository_1 = require("../repositories/invoicetickets.repository");
const event_repository_1 = require("../repositories/event.repository");
const eventstages_repository_1 = require("../repositories/eventstages.repository");
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const eventdcto_repository_1 = require("../repositories/eventdcto.repository");
const user_repository_1 = require("../repositories/user.repository");
const ticket_service_1 = require("./ticket.service");
const client_1 = require("@prisma/client");
const promoter_code_service_1 = require("./promoter_code.service");
const points_service_1 = require("./points.service");
const interests_service_1 = require("./interests.service");
const constants_1 = require("../config/constants");
const event_private_guest_repository_1 = require("../repositories/event_private_guest.repository");
const invoiceRepo = new invoice_repository_1.InvoiceRepository();
const invoiceTicketsRepo = new invoicetickets_repository_1.InvoiceTicketsRepository();
const eventRepo = new event_repository_1.EventRepository();
const stagesRepo = new eventstages_repository_1.EventStagesRepository();
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
const dctoRepo = new eventdcto_repository_1.EventDctoRepository();
const userRepo = new user_repository_1.UserRepository();
const ticketService = new ticket_service_1.TicketService();
const promoCodeService = new promoter_code_service_1.PromoterCodeService();
const guestRepo = new event_private_guest_repository_1.EventPrivateGuestRepository();
class InvoiceService {
    /**
     * Crear una nueva factura con sus items
     */
    createInvoice(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Verificar que el evento existe
            const event = yield eventRepo.findById(data.event_id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar que el evento esté disponible para compra
            if (!['APPROVED', 'SCHEDULED', 'ACTIVE'].includes(event.status)) {
                throw new Error('Este evento no está disponible para compra');
            }
            // Obtener información del usuario
            const user = yield userRepo.findById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Validar acceso a eventos privados con confirmación requerida
            if (event.event_type === 'PRIVADO' && event.confirmation_required) {
                const guest = yield guestRepo.findByEventAndEmail(data.event_id, user.email);
                if (!guest || guest.status !== 'CONFIRMED') {
                    throw new Error('No estás en la lista de invitados confirmados para este evento privado');
                }
            }
            // Caso 1.1: Límite global del evento
            const newQtyTotal = data.items.reduce((sum, i) => sum + i.qty_tickets, 0);
            if (event.num_max_tickets > 0) {
                const soldTotal = yield invoiceTicketsRepo.countTotalTicketsSoldByEventId(data.event_id);
                if (soldTotal + newQtyTotal > event.num_max_tickets) {
                    const available = event.num_max_tickets - soldTotal;
                    throw new Error(`No hay suficientes tickets disponibles para este evento. Disponibles: ${available}`);
                }
            }
            // Calcular totales y validar disponibilidad
            let totalTickets = 0;
            let totalRegular = 0;
            let totalWithDiscount = 0;
            const invoiceItemsData = [];
            for (const item of data.items) {
                // Obtener información del stage
                const stage = yield stagesRepo.findById(item.stage_id);
                if (!stage) {
                    throw new Error(`Stage ${item.stage_id} no encontrado`);
                }
                // Verificar que el stage pertenece al evento
                // Verificar que el stage pertenece al evento
                const stageLocality = yield localitiesRepo.findById(stage.locality_id);
                if (!stageLocality || stageLocality.event_id !== data.event_id) {
                    throw new Error('El stage no pertenece a este evento');
                }
                // Caso 1.2: Localidad con límite propio habilitado
                if (stageLocality.require_num_tickets && ((_a = stageLocality.num_max_tickets) !== null && _a !== void 0 ? _a : 0) > 0) {
                    const available = ((_b = stageLocality.num_max_tickets) !== null && _b !== void 0 ? _b : 0) - ((_c = stageLocality.num_tickets_sold) !== null && _c !== void 0 ? _c : 0);
                    if (item.qty_tickets > available) {
                        throw new Error(`No hay suficientes tickets disponibles en la localidad "${stageLocality.name_locality}". Disponibles: ${available}`);
                    }
                }
                const itemTotal = stage.price_ticket * item.qty_tickets;
                totalTickets += item.qty_tickets;
                totalRegular += itemTotal;
                invoiceItemsData.push({
                    invoice_id: 0, // Se asignará después de crear la factura
                    stage_id: item.stage_id,
                    stage_name: stage.stage_name,
                    locality_id: item.locality_id,
                    locality_name: stageLocality.name_locality,
                    qty_tickets: item.qty_tickets,
                    price_ticket: stage.price_ticket,
                    apply_discount: 0,
                    discount_type: 0,
                    discount_value: 0,
                    total_ticket_dcto: 0,
                    total_ticket_regular: itemTotal,
                    total_ticket_paid: itemTotal,
                    purchase_date: new Date(),
                    status_item: 0, // Pendiente
                });
            }
            // Aplicar descuento si existe
            let discountApplied = 0;
            let discountType = 0;
            let discountValue = 0;
            if (data.discount_code) {
                const discount = yield dctoRepo.findByName(data.event_id, data.discount_code);
                if (discount) {
                    // ✅ Validar que esté activo
                    if (!discount.is_active) {
                        throw new Error('Este código de descuento no está activo');
                    }
                    // ✅ Validar max_uses
                    if (discount.max_uses && discount.uses_count >= discount.max_uses) {
                        throw new Error('Este código de descuento ha alcanzado el límite de usos');
                    }
                    // Validar que el descuento es aplicable
                    if (discount.min_qty_tickets && totalTickets < discount.min_qty_tickets) {
                        throw new Error(`El descuento requiere al menos ${discount.min_qty_tickets} tickets`);
                    }
                    if (discount.max_qty_tickets && totalTickets > discount.max_qty_tickets) {
                        throw new Error(`El descuento solo aplica hasta ${discount.max_qty_tickets} tickets`);
                    }
                    discountApplied = 1;
                    discountType = discount.type_dcto;
                    discountValue = discount.value_dcto;
                    // Calcular descuento
                    if (discount.type_dcto === 1) {
                        // Porcentaje
                        totalWithDiscount = totalRegular - Math.round((totalRegular * discount.value_dcto) / 100);
                    }
                    else {
                        // Monto fijo
                        totalWithDiscount = Math.max(0, totalRegular - discount.value_dcto);
                    }
                }
            }
            // ── Comisión Promotor + dcto opcional al cliente ──────────────────────
            let promoter_code_id = null;
            let promoter_commission_amount = 0;
            if (data.promoter_code && event.allow_external_promoters) {
                const promoData = yield promoCodeService.applyCodeToInvoice(data.promoter_code, data.event_id);
                if (promoData) {
                    promoter_code_id = promoData.promoter_code_id;
                    const rule = promoData.reward_rule;
                    if ((rule === null || rule === void 0 ? void 0 : rule.apply_customer_discount) &&
                        rule.customer_discount_type &&
                        rule.customer_discount_value) {
                        discountApplied = 1;
                        discountType = rule.customer_discount_type;
                        discountValue = rule.customer_discount_value;
                        if (rule.customer_discount_type === 1) {
                            totalWithDiscount = totalRegular -
                                Math.round((totalRegular * rule.customer_discount_value) / 100);
                        }
                        else {
                            totalWithDiscount = Math.max(0, totalRegular - rule.customer_discount_value);
                        }
                    }
                    const commissionBase = (rule === null || rule === void 0 ? void 0 : rule.commission_base) === 'ON_ORIGINAL'
                        ? totalRegular
                        : (discountApplied ? totalWithDiscount : totalRegular);
                    promoter_commission_amount = promoCodeService.calculatePromoterCommission(commissionBase, totalTickets, rule);
                }
            }
            // ── Método de pago ───────────────────────────────────────────────
            // Códigos Wompi soportados (ver PaymentMethodFactory) + POINTS (interno)
            const VALID_PAYMENT_METHODS = [
                'CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER', 'BANCOLOMBIA_QR',
                'BANCOLOMBIA_COLLECT', 'DAVIPLATA', 'BANCOLOMBIA_BNPL', 'PCOL', 'POINTS',
            ];
            const _rawMethod = data.payment_method;
            const paymentMethod = (() => {
                var _a;
                const raw = !_rawMethod
                    ? 'CARD'
                    : typeof _rawMethod === 'string'
                        ? _rawMethod
                        : _rawMethod.type;
                const normalized = String(raw).toUpperCase();
                const aliases = { CREDIT_CARD: 'CARD', BNPL: 'BANCOLOMBIA_BNPL' };
                const code = (_a = aliases[normalized]) !== null && _a !== void 0 ? _a : normalized;
                if (!VALID_PAYMENT_METHODS.includes(code)) {
                    throw new Error(`Método de pago inválido: "${raw}". Permitidos: ${VALID_PAYMENT_METHODS.join(', ')}`);
                }
                return code;
            })();
            let pointsUsed = 0;
            let pointsDiscount = 0;
            if (paymentMethod === 'POINTS' && data.points_to_use && data.points_to_use > 0) {
                const pointsSvc = new points_service_1.PointsService();
                const balance = yield pointsSvc.getBalance(userId);
                if (balance.current_balance < data.points_to_use) {
                    throw new Error(`Saldo de puntos insuficiente. Disponible: ${balance.current_balance}, Solicitado: ${data.points_to_use}`);
                }
                pointsUsed = data.points_to_use;
                pointsDiscount = (0, constants_1.calculateDiscountFromPoints)(pointsUsed);
            }
            // ── finalTotal único — después de ambos descuentos ───────────────
            const baseTotal = discountApplied ? totalWithDiscount : totalRegular;
            const finalTotal = Math.max(0, baseTotal - pointsDiscount);
            /*
             1. Descuento organizador (discount_code)
            2. Descuento/comisión promotor (promoter_code)
            3. finalTotal — declarado UNA sola vez
            4. Comisión PayPac — sobre el finalTotal correcto
            */
            // ── Comisión PayPac — sobre el finalTotal real ───────────────────
            const paypac_commission_pct = (_d = event.commission_percentage) !== null && _d !== void 0 ? _d : 0;
            //const paypac_commission_amount = Math.round(finalTotal * paypac_commission_pct / 100);
            const paypac_commission_amount = Math.round(totalRegular * paypac_commission_pct / 100);
            // ── Documento del usuario ────────────────────────────────────────
            let finalNumDoc = user.num_doc || '';
            let finalTypeDoc = user.type_doc || 'CC';
            if (!user.num_doc && data.user_num_doc) {
                // Primera compra — guardar en BD para futuras compras
                finalNumDoc = data.user_num_doc;
                finalTypeDoc = (_e = data.user_type_doc) !== null && _e !== void 0 ? _e : 'CC';
                yield userRepo.update(userId, {
                    num_doc: data.user_num_doc,
                    type_doc: (_f = data.user_type_doc) !== null && _f !== void 0 ? _f : 'CC',
                });
            }
            if (!finalNumDoc) {
                throw new Error('Se requiere número de documento para completar la compra');
            }
            // Generar número de factura
            const numInvoice = yield invoiceRepo.generateInvoiceNumber();
            // Crear la factura
            const invoiceData = {
                user_id: userId,
                user_uid: user.firebase_uid || '',
                num_invoice: numInvoice,
                user_name: user.name,
                user_lastname: user.last_name,
                user_num_doc: finalNumDoc, // ← actualizado
                user_type_doc: finalTypeDoc, // ← actualizado
                customer_UUID_phone: (_g = data.device_uuid) !== null && _g !== void 0 ? _g : null,
                payment_method: paymentMethod,
                sale_channel: (_h = data.sale_channel) !== null && _h !== void 0 ? _h : 'WEB',
                points_used: pointsUsed,
                points_discount: pointsDiscount,
                num_items: totalTickets,
                event_id: data.event_id,
                apply_discount: discountApplied,
                discount_type: discountType,
                discount_value: discountValue,
                total_ticket_dcto: totalWithDiscount,
                total_ticket_regular: totalRegular,
                total: finalTotal,
                status: client_1.InvoiceStatus.ISSUED, // Emitida, esperando pago
                // ── Comisiones ──────────────────────────────────
                paypac_commission_pct,
                paypac_commission_amount,
                promoter_commission_amount,
                promoter_code_id,
            };
            const invoice = yield invoiceRepo.create(invoiceData);
            // Crear los items de la factura
            const itemsWithInvoiceId = invoiceItemsData.map(item => (Object.assign(Object.assign({}, item), { invoice_id: invoice.id, apply_discount: discountApplied, discount_type: discountType, discount_value: discountValue, total_ticket_dcto: discountApplied ? Math.round((item.total_ticket_regular * discountValue) / 100) : 0, total_ticket_paid: discountApplied
                    ? item.total_ticket_regular - Math.round((item.total_ticket_regular * discountValue) / 100)
                    : item.total_ticket_regular })));
            yield invoiceTicketsRepo.createMany(itemsWithInvoiceId);
            if (discountApplied && data.discount_code) {
                yield dctoRepo.incrementUses(data.event_id, data.discount_code);
            }
            // Retornar factura con items
            const items = yield invoiceTicketsRepo.findByInvoiceId(invoice.id);
            return {
                invoice,
                items,
            };
        });
    }
    /**
     * Obtener factura por ID
     */
    getInvoiceById(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = yield invoiceRepo.findById(id);
            if (!invoice) {
                throw new Error('Factura no encontrada');
            }
            // Verificar permisos
            const isOwner = invoice.user_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            // Si es ORGANIZER, verificar que sea de su evento
            let isEventOwner = false;
            if (userRole === 'ORGANIZER') {
                const event = yield eventRepo.findById(invoice.event_id);
                isEventOwner = (event === null || event === void 0 ? void 0 : event.organizer_id) === userId;
            }
            if (!isOwner && !isPaypac && !isEventOwner) {
                throw new Error('No tienes permisos para ver esta factura');
            }
            // Obtener items
            const items = yield invoiceTicketsRepo.findByInvoiceId(id);
            return {
                invoice,
                items,
            };
        });
    }
    /**
     * Obtener facturas del usuario autenticado
     */
    getMyInvoices(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoices = yield invoiceRepo.findByUserId(userId);
            // Obtener items de cada factura
            const invoicesWithItems = yield Promise.all(invoices.map((invoice) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    invoice,
                    items: yield invoiceTicketsRepo.findByInvoiceId(invoice.id),
                });
            })));
            return invoicesWithItems;
        });
    }
    /**
     * Obtener facturas de un evento
     */
    getEventInvoices(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver las facturas de este evento');
            }
            return invoiceRepo.findByEventId(eventId);
        });
    }
    /**
     * 🎫 Actualizar estado de factura (usado por webhook de pago)
     * ACTUALIZADO: Ahora crea tickets reales cuando el pago es exitoso
     */
    /**
   * 🎫 Actualizar estado de factura (usado por webhook de pago)
   * ACTUALIZADO: Ahora crea tickets reales cuando el pago es exitoso
   */
    updateInvoiceStatus(invoiceId, transactionId, status, customerIdPhone) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const invoice = yield invoiceRepo.findById(invoiceId);
            if (!invoice) {
                throw new Error('Factura no encontrada');
            }
            // Actualizar factura
            const updatedInvoice = yield invoiceRepo.update(invoiceId, { status });
            // 🎫 Si el pago fue exitoso, crear los tickets reales
            if (status === client_1.InvoiceStatus.PAID) {
                // 1. Actualizar items a "Expedido"
                yield invoiceTicketsRepo.updateManyByInvoiceId(invoiceId, {
                    status_item: 1, // Expedido
                });
                // 2. Obtener datos del evento
                const event = yield eventRepo.findById(invoice.event_id);
                if (!event) {
                    throw new Error('Evento no encontrado');
                }
                // 3. Obtener los items de la factura
                const invoiceItems = yield invoiceTicketsRepo.findByInvoiceId(invoiceId);
                // 4. Preparar items con colores de localidad
                const itemsForTickets = yield Promise.all(invoiceItems.map((item) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    // Obtener localidad completa con colores
                    const locality = yield localitiesRepo.findById(item.locality_id);
                    return {
                        stage_id: item.stage_id,
                        stage_name: item.stage_name,
                        locality_id: item.locality_id,
                        locality_name: item.locality_name,
                        qty_tickets: item.qty_tickets,
                        price_ticket: item.price_ticket,
                        locality_colors: {
                            bkg_color: (locality === null || locality === void 0 ? void 0 : locality.bkg_color) || '#000000',
                        },
                        is_consumable: (_a = locality === null || locality === void 0 ? void 0 : locality.is_consumable) !== null && _a !== void 0 ? _a : false,
                        vip_access: (_b = locality === null || locality === void 0 ? void 0 : locality.vip_access) !== null && _b !== void 0 ? _b : false,
                    };
                })));
                // 5. Crear los tickets usando TicketService
                const ticketsResult = yield ticketService.createTicketsFromInvoice(transactionId, {
                    user_id: invoice.user_id,
                    user_uid: invoice.user_uid,
                    event_id: invoice.event_id,
                    device_uuid: (_a = invoice.customer_UUID_phone) !== null && _a !== void 0 ? _a : undefined, // ← propagar
                    items: itemsForTickets,
                }, {
                    name: event.name,
                    short_description: event.short_description,
                    cover: event.cover,
                    date_event: event.date_event,
                    place_address: event.place_address,
                    event_type: event.event_type,
                    type_venue: event.type_venue,
                    organizer_id: event.organizer_id,
                    status: event.status,
                }, customerIdPhone);
                console.log(`✅ ${ticketsResult.count} tickets creados para la factura ${invoice.num_invoice}`);
                // Casos 1.2 y 1.3: actualizar num_tickets_sold por localidad
                const localityQtyMap = invoiceItems.reduce((acc, item) => {
                    var _a;
                    acc[item.locality_id] = ((_a = acc[item.locality_id]) !== null && _a !== void 0 ? _a : 0) + item.qty_tickets;
                    return acc;
                }, {});
                yield Promise.all(Object.entries(localityQtyMap).map(([localityId, qty]) => localitiesRepo.incrementTicketsSold(Number(localityId), qty)));
                // Descontar puntos si el pago fue con puntos (bloqueante — debe completarse antes de confirmar)
                if (invoice.points_used > 0) {
                    yield new points_service_1.PointsService().redeemPointsForPurchase(invoice.user_id, invoice.id, invoice.points_used);
                }
                // Otorgar puntos e intereses de forma asíncrona (no bloquea la respuesta)
                Promise.all([
                    new points_service_1.PointsService().awardPointsForPurchase(invoice.user_id, invoice.id, invoice.total_ticket_regular).catch((err) => console.error('⚠️ Error otorgando puntos:', err)),
                    (() => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        try {
                            if (event.category_id) {
                                yield new interests_service_1.InterestsService().recordInterestFromPurchase(invoice.user_id, event.category_id, (_a = event.subcategory_id) !== null && _a !== void 0 ? _a : undefined, (_b = event.subgenre_id) !== null && _b !== void 0 ? _b : undefined);
                            }
                        }
                        catch (err) {
                            console.error('⚠️ Error registrando interés:', err);
                        }
                    }))(),
                ]);
            }
            return updatedInvoice;
        });
    }
    /* async updateInvoiceStatus(
      invoiceId: number,
      transactionId: number,
      status: InvoiceStatus,
      customerIdPhone: string
    ) {
      const invoice = await invoiceRepo.findById(invoiceId);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }
  
      // Actualizar factura
      const updatedInvoice = await invoiceRepo.update(invoiceId, { status });
  
      // 🎫 Si el pago fue exitoso, crear los tickets reales
      if (status === InvoiceStatus.PAID) {
        // 1. Actualizar items a "Expedido"
        await invoiceTicketsRepo.updateManyByInvoiceId(invoiceId, {
          status_item: 1, // Expedido
        });
  
        // 2. Obtener datos del evento
        const event = await eventRepo.findById(invoice.event_id);
        if (!event) {
          throw new Error('Evento no encontrado');
        }
  
        // 3. Obtener los items de la factura
        const invoiceItems = await invoiceTicketsRepo.findByInvoiceId(invoiceId);
  
        // 4. Preparar items con colores de localidad
        const itemsForTickets = await Promise.all(
          invoiceItems.map(async (item) => {
            // Obtener localidad completa
            const locality = await localitiesRepo.findById(item.locality_id);
            
            return {
              stage_id: item.stage_id,
              stage_name: item.stage_name,
              locality_id: item.locality_id,
              locality_name: item.locality_name,
              qty_tickets: item.qty_tickets,
              price_ticket: item.price_ticket,
              locality_colors: locality ? { bkg_color: locality.bkg_color } : undefined,
            };
          })
        );
  
        // 5. Crear los tickets usando TicketService
        const ticketsResult = await ticketService.createTicketsFromInvoice(
          transactionId,
          {
            user_id: invoice.user_id,
            user_uid: invoice.user_uid,
            event_id: invoice.event_id,
            items: itemsForTickets as any,
          },
          {
            name: event.name,
            short_description: event.short_description,
            cover: event.cover,
            date_event: event.date_event,
            place_address: event.place_address,
            event_type: event.event_type,
            type_venue: event.type_venue,
            organizer_id: event.organizer_id,
            status: event.status,
          },
          customerIdPhone
        );
  
        console.log(`✅ ${ticketsResult.count} tickets creados para la factura ${invoice.num_invoice}`);
  
        // TODO FASE 2:
        // - Crear EventBalancePromoters si hay referencia de promotor
        // - Enviar notificación/email con tickets
        // - Emitir evento Socket.IO para notificar al usuario
      }
  
      return updatedInvoice;
    } */
    /**
     * Cancelar factura
     */
    cancelInvoice(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = yield invoiceRepo.findById(id);
            if (!invoice) {
                throw new Error('Factura no encontrada');
            }
            // Solo el dueño o PAYPAC pueden cancelar
            const isOwner = invoice.user_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para cancelar esta factura');
            }
            // No se puede cancelar una factura pagada
            if (invoice.status === client_1.InvoiceStatus.PAID) {
                throw new Error('No se puede cancelar una factura pagada. Solicita un reembolso.');
            }
            return invoiceRepo.update(id, { status: client_1.InvoiceStatus.CANCELED });
        });
    }
    /**
     * Obtener estadísticas de facturas de un evento
     */
    getEventInvoiceStats(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver estas estadísticas');
            }
            return invoiceRepo.getEventInvoiceStats(eventId);
        });
    }
}
exports.InvoiceService = InvoiceService;
