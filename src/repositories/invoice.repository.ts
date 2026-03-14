import { prisma } from '../config/db';
import { Invoice, Prisma, InvoiceStatus } from '@prisma/client';

export class InvoiceRepository {
  /**
   * Crear una nueva factura
   */
  async create(data: Prisma.InvoiceUncheckedCreateInput): Promise<Invoice> {
    return prisma.invoice.create({
      data,
    });
  }

  /**
   * Buscar factura por ID
   */
  async findById(id: number): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar factura por número de factura
   */
  async findByInvoiceNumber(numInvoice: string): Promise<Invoice | null> {
    return prisma.invoice.findFirst({
      where: { num_invoice: numInvoice },
    });
  }

  /**
   * Obtener todas las facturas de un usuario
   */
  async findByUserId(userId: number): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { user_id: userId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Obtener facturas de un usuario por UID
   */
  async findByUserUid(userUid: string): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { user_uid: userUid },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Obtener facturas de un evento
   */
  async findByEventId(eventId: number): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { event_id: eventId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Obtener facturas por estado
   */
  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { status },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Actualizar factura
   */
  async update(id: number, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar factura
   */
  async delete(id: number): Promise<Invoice> {
    return prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Contar facturas de un usuario
   */
  async countByUserId(userId: number): Promise<number> {
    return prisma.invoice.count({
      where: { user_id: userId },
    });
  }

  /**
   * Contar facturas de un evento
   */
  async countByEventId(eventId: number): Promise<number> {
    return prisma.invoice.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Obtener estadísticas de facturas de un evento
   */
  async getEventInvoiceStats(eventId: number) {
    const invoices = await this.findByEventId(eventId);

    const stats = {
      total_invoices: invoices.length,
      by_status: {
        ISSUED: invoices.filter(i => i.status === InvoiceStatus.ISSUED).length,
          PROCESSING
: invoices.filter(i => i.status === InvoiceStatus.  PROCESSING
).length,
        PAID: invoices.filter(i => i.status === InvoiceStatus.PAID).length,
        PENDING: invoices.filter(i => i.status === InvoiceStatus.PENDING).length,
        REJECTED: invoices.filter(i => i.status === InvoiceStatus.REJECTED).length,
        CANCELED: invoices.filter(i => i.status === InvoiceStatus.CANCELED).length,
      },
      total_revenue: invoices
        .filter(i => i.status === InvoiceStatus.PAID)
        .reduce((sum, i) => sum + i.total, 0),
      total_tickets_sold: invoices
        .filter(i => i.status === InvoiceStatus.PAID)
        .reduce((sum, i) => sum + i.num_items, 0),
    };

    return stats;
  }

  /**
   * Verificar si existe factura
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.invoice.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Generar número de factura único
   */
  async generateInvoiceNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${timestamp}-${random}`;
  }
}