import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceTicketsRepository } from '../repositories/invoiceTickets.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventStagesRepository } from '../repositories/eventStages.repository';
import { EventDctoRepository } from '../repositories/eventDcto.repository';
import { UserRepository } from '../repositories/user.repository';
import { Prisma, InvoiceStatus } from '@prisma/client';

const invoiceRepo = new InvoiceRepository();
const invoiceTicketsRepo = new InvoiceTicketsRepository();
const eventRepo = new EventRepository();
const stagesRepo = new EventStagesRepository();
const dctoRepo = new EventDctoRepository();
const userRepo = new UserRepository();

export class InvoiceService {
  /**
   * Crear una nueva factura con sus items
   */
  async createInvoice(
    userId: number,
    data: {
      event_id: number;
      items: Array<{
        stage_id: number;
        locality_id: number;
        qty_tickets: number;
      }>;
      discount_code?: string;
    }
  ) {
    // Verificar que el evento existe
    const event = await eventRepo.findById(data.event_id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que el evento esté disponible para compra
    if (!['APPROVED', 'SCHEDULED', 'ACTIVE'].includes(event.status)) {
      throw new Error('Este evento no está disponible para compra');
    }

    // Obtener información del usuario
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Calcular totales y validar disponibilidad
    let totalTickets = 0;
    let totalRegular = 0;
    let totalWithDiscount = 0;
    const invoiceItemsData: Prisma.InvoiceTicketsUncheckedCreateInput[] = [];

    for (const item of data.items) {
      // Obtener información del stage
      const stage = await stagesRepo.findById(item.stage_id);
      if (!stage) {
        throw new Error(`Stage ${item.stage_id} no encontrado`);
      }

      // Verificar que el stage pertenece al evento
      if (stage.locality.event_id !== data.event_id) {
        throw new Error('El stage no pertenece a este evento');
      }

      // TODO: Verificar disponibilidad de tickets
      // const soldTickets = await invoiceTicketsRepo.countTicketsByStageId(item.stage_id);
      // if (soldTickets + item.qty_tickets > maxCapacity) {
      //   throw new Error('No hay suficientes tickets disponibles');
      // }

      const itemTotal = stage.price_ticket * item.qty_tickets;
      totalTickets += item.qty_tickets;
      totalRegular += itemTotal;

      invoiceItemsData.push({
        invoice_id: 0, // Se asignará después de crear la factura
        stage_id: item.stage_id,
        stage_name: stage.stage_name,
        locality_id: item.locality_id,
        locality_name: stage.locality.name_locality,
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
      const discount = await dctoRepo.findByName(data.event_id, data.discount_code);
      
      if (discount) {
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
        } else {
          // Monto fijo
          totalWithDiscount = Math.max(0, totalRegular - discount.value_dcto);
        }
      }
    }

    const finalTotal = discountApplied ? totalWithDiscount : totalRegular;

    // Generar número de factura
    const numInvoice = await invoiceRepo.generateInvoiceNumber();

    // Crear la factura
    const invoiceData: Prisma.InvoiceUncheckedCreateInput = {
      user_id: userId,
      user_uid: user.uid || '',
      num_invoice: numInvoice,
      user_name: user.name,
      user_lastname: user.last_name,
      user_num_doc: user.num_doc || '',
      user_type_doc: user.type_doc || 0,
      num_items: totalTickets,
      event_id: data.event_id,
      apply_discount: discountApplied,
      discount_type: discountType,
      discount_value: discountValue,
      total_ticket_dcto: totalWithDiscount,
      total_ticket_regular: totalRegular,
      total: finalTotal,
      status: InvoiceStatus.ISSUED, // Emitida, esperando pago
    };

    const invoice = await invoiceRepo.create(invoiceData);

    // Crear los items de la factura
    const itemsWithInvoiceId = invoiceItemsData.map(item => ({
      ...item,
      invoice_id: invoice.id,
      apply_discount: discountApplied,
      discount_type: discountType,
      discount_value: discountValue,
      total_ticket_dcto: discountApplied ? Math.round((item.total_ticket_regular * discountValue) / 100) : 0,
      total_ticket_paid: discountApplied 
        ? item.total_ticket_regular - Math.round((item.total_ticket_regular * discountValue) / 100)
        : item.total_ticket_regular,
    }));

    await invoiceTicketsRepo.createMany(itemsWithInvoiceId);

    // Retornar factura con items
    const items = await invoiceTicketsRepo.findByInvoiceId(invoice.id);

    return {
      invoice,
      items,
    };
  }

  /**
   * Obtener factura por ID
   */
  async getInvoiceById(id: number, userId: number, userRole: string) {
    const invoice = await invoiceRepo.findById(id);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Verificar permisos
    const isOwner = invoice.user_id === userId;
    const isPaypac = userRole === 'PAYPAC';
    
    // Si es ORGANIZER, verificar que sea de su evento
    let isEventOwner = false;
    if (userRole === 'ORGANIZER') {
      const event = await eventRepo.findById(invoice.event_id);
      isEventOwner = event?.organizer_id === userId;
    }

    if (!isOwner && !isPaypac && !isEventOwner) {
      throw new Error('No tienes permisos para ver esta factura');
    }

    // Obtener items
    const items = await invoiceTicketsRepo.findByInvoiceId(id);

    return {
      invoice,
      items,
    };
  }

  /**
   * Obtener facturas del usuario autenticado
   */
  async getMyInvoices(userId: number) {
    const invoices = await invoiceRepo.findByUserId(userId);
    
    // Obtener items de cada factura
    const invoicesWithItems = await Promise.all(
      invoices.map(async (invoice) => ({
        invoice,
        items: await invoiceTicketsRepo.findByInvoiceId(invoice.id),
      }))
    );

    return invoicesWithItems;
  }

  /**
   * Obtener facturas de un evento
   */
  async getEventInvoices(eventId: number, userId: number, userRole: string) {
    const event = await eventRepo.findById(eventId);
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
  }

  /**
   * Actualizar estado de factura (usado por webhook de pago)
   */
  async updateInvoiceStatus(
    invoiceId: number,
    status: InvoiceStatus
  ) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Actualizar factura
    const updatedInvoice = await invoiceRepo.update(invoiceId, { status });

    // Si el pago fue exitoso, actualizar items a "Expedido"
    if (status === InvoiceStatus.PAID) {
      await invoiceTicketsRepo.updateManyByInvoiceId(invoiceId, {
        status_item: 1, // Expedido
      });

      // TODO: Aquí se debe llamar a:
      // 1. Crear Tickets reales (tabla Ticket)
      // 2. Crear EventBalancePromoters si hay referencia de promotor
      // 3. Enviar notificación/email con tickets
    }

    return updatedInvoice;
  }

  /**
   * Cancelar factura
   */
  async cancelInvoice(id: number, userId: number, userRole: string) {
    const invoice = await invoiceRepo.findById(id);
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
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('No se puede cancelar una factura pagada. Solicita un reembolso.');
    }

    return invoiceRepo.update(id, { status: InvoiceStatus.CANCELED });
  }

  /**
   * Obtener estadísticas de facturas de un evento
   */
  async getEventInvoiceStats(eventId: number, userId: number, userRole: string) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver estas estadísticas');
    }

    return invoiceRepo.getEventInvoiceStats(eventId);
  }
}