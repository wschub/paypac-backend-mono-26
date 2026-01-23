import { InvoiceTicketsRepository } from '../repositories/invoicetickets.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';

const invoiceTicketsRepo = new InvoiceTicketsRepository();
const invoiceRepo = new InvoiceRepository();

export class InvoiceTicketsService {
  /**
   * Obtener items de una factura
   */
  async getInvoiceItems(invoiceId: number, userId: number, userRole: string) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Verificar permisos
    const isOwner = invoice.user_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver los items de esta factura');
    }

    return invoiceTicketsRepo.findByInvoiceId(invoiceId);
  }

  /**
   * Obtener item por ID
   */
  async getItemById(id: number, userId: number, userRole: string) {
    const item = await invoiceTicketsRepo.findById(id);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    // Verificar permisos a través de la factura
    const invoice = await invoiceRepo.findById(item.invoice_id);
    if (!invoice) {
      throw new Error('Factura asociada no encontrada');
    }

    const isOwner = invoice.user_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver este item');
    }

    return item;
  }

  /**
   * Obtener tickets vendidos por stage
   */
  async getTicketsSoldByStage(stageId: number) {
    return invoiceTicketsRepo.countTicketsByStageId(stageId);
  }

  /**
   * Obtener tickets vendidos por localidad
   */
  async getTicketsSoldByLocality(localityId: number) {
    return invoiceTicketsRepo.countTicketsByLocalityId(localityId);
  }

  /**
   * Obtener ingresos por stage
   */
  async getRevenueByStage(stageId: number, userId: number, userRole: string) {
    // Solo ORGANIZER o PAYPAC pueden ver ingresos
    if (!['ORGANIZER', 'PAYPAC'].includes(userRole)) {
      throw new Error('No tienes permisos para ver esta información');
    }

    return invoiceTicketsRepo.getRevenueByStageId(stageId);
  }

  /**
   * Obtener resumen de ventas por evento
   */
  async getSalesSummaryByEvent(eventId: number, userId: number, userRole: string) {
    // Solo ORGANIZER o PAYPAC pueden ver resumen
    if (!['ORGANIZER', 'PAYPAC'].includes(userRole)) {
      throw new Error('No tienes permisos para ver esta información');
    }

    return invoiceTicketsRepo.getSalesSummaryByEvent(eventId);
  }
}