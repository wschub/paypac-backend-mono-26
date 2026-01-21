import { prisma } from '../config/db';
import { InvoiceTickets, Prisma } from '@prisma/client';

export class InvoiceTicketsRepository {
  /**
   * Crear un nuevo item de factura
   */
  async create(data: Prisma.InvoiceTicketsUncheckedCreateInput): Promise<InvoiceTickets> {
    return prisma.invoiceTickets.create({
      data,
    });
  }

  /**
   * Crear múltiples items de factura en lote
   */
  async createMany(data: Prisma.InvoiceTicketsUncheckedCreateInput[]): Promise<number> {
    const result = await prisma.invoiceTickets.createMany({
      data,
    });
    return result.count;
  }

  /**
   * Buscar item por ID
   */
  async findById(id: number): Promise<InvoiceTickets | null> {
    return prisma.invoiceTickets.findUnique({
      where: { id },
    });
  }

  /**
   * Obtener todos los items de una factura
   */
  async findByInvoiceId(invoiceId: number): Promise<InvoiceTickets[]> {
    return prisma.invoiceTickets.findMany({
      where: { invoice_id: invoiceId },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Obtener items por stage
   */
  async findByStageId(stageId: number): Promise<InvoiceTickets[]> {
    return prisma.invoiceTickets.findMany({
      where: { stage_id: stageId },
      orderBy: { purchase_date: 'desc' },
    });
  }

  /**
   * Obtener items por localidad
   */
  async findByLocalityId(localityId: number): Promise<InvoiceTickets[]> {
    return prisma.invoiceTickets.findMany({
      where: { locality_id: localityId },
      orderBy: { purchase_date: 'desc' },
    });
  }

  /**
   * Actualizar item
   */
  async update(
    id: number,
    data: Prisma.InvoiceTicketsUpdateInput
  ): Promise<InvoiceTickets> {
    return prisma.invoiceTickets.update({
      where: { id },
      data,
    });
  }

  /**
   * Actualizar múltiples items (cuando se paga la factura)
   */
  async updateManyByInvoiceId(
    invoiceId: number,
    data: Prisma.InvoiceTicketsUpdateInput
  ): Promise<number> {
    const result = await prisma.invoiceTickets.updateMany({
      where: { invoice_id: invoiceId },
      data,
    });
    return result.count;
  }

  /**
   * Eliminar item
   */
  async delete(id: number): Promise<InvoiceTickets> {
    return prisma.invoiceTickets.delete({
      where: { id },
    });
  }

  /**
   * Eliminar todos los items de una factura
   */
  async deleteByInvoiceId(invoiceId: number): Promise<number> {
    const result = await prisma.invoiceTickets.deleteMany({
      where: { invoice_id: invoiceId },
    });
    return result.count;
  }

  /**
   * Contar tickets vendidos por stage
   */
  async countTicketsByStageId(stageId: number): Promise<number> {
    const items = await this.findByStageId(stageId);
    return items
      .filter(item => item.status_item === 1) // Solo tickets expedidos (pagados)
      .reduce((sum, item) => sum + item.qty_tickets, 0);
  }

  /**
   * Contar tickets vendidos por localidad
   */
  async countTicketsByLocalityId(localityId: number): Promise<number> {
    const items = await this.findByLocalityId(localityId);
    return items
      .filter(item => item.status_item === 1)
      .reduce((sum, item) => sum + item.qty_tickets, 0);
  }

  /**
   * Calcular ingresos por stage
   */
  async getRevenueByStageId(stageId: number): Promise<number> {
    const items = await this.findByStageId(stageId);
    return items
      .filter(item => item.status_item === 1)
      .reduce((sum, item) => sum + item.total_ticket_paid, 0);
  }

  /**
   * Verificar si existe item
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.invoiceTickets.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Obtener resumen de ventas por localidad de un evento
   */
  async getSalesSummaryByEvent(eventId: number) {
    // Obtener todas las facturas pagadas del evento
    const invoices = await prisma.invoice.findMany({
      where: {
        event_id: eventId,
        status: 'PAID',
      },
      select: { id: true },
    });

    const invoiceIds = invoices.map(inv => inv.id);

    // Obtener todos los items de esas facturas
    const items = await prisma.invoiceTickets.findMany({
      where: {
        invoice_id: { in: invoiceIds },
        status_item: 1, // Expedido
      },
    });

    // Agrupar por localidad
    const byLocality = items.reduce((acc, item) => {
      const key = item.locality_id;
      if (!acc[key]) {
        acc[key] = {
          locality_id: item.locality_id,
          locality_name: item.locality_name,
          total_tickets: 0,
          total_revenue: 0,
        };
      }
      acc[key].total_tickets += item.qty_tickets;
      acc[key].total_revenue += item.total_ticket_paid;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(byLocality);
  }
}