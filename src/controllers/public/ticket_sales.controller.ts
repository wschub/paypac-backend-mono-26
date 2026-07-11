import { Request, Response } from 'express';
import { TicketSaleService } from '../../services/ticket_sale.service';

const saleService = new TicketSaleService();

/**
 * GET /api/public/ticket-sales/event/:eventId
 * Listings activos de reventa de un evento (sin identidad del vendedor).
 * La web muestra la sección solo cuando el evento/localidad está agotado.
 */
export const getPublicListingsByEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId as string);
    if (!eventId) {
      res.status(400).json({ message: 'eventId inválido' });
      return;
    }
    const result = await saleService.getActiveListingsByEvent(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getPublicListingsByEvent:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Error al obtener reventas' });
  }
};

/**
 * GET /api/public/ticket-sales/:listingId
 * Detalle público de un listing (link directo compartible).
 */
export const getPublicListingDetail = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    if (!listingId) {
      res.status(400).json({ message: 'listingId inválido' });
      return;
    }
    const listing = await saleService.getListingPublicDetail(listingId);
    res.status(200).json({ listing });
  } catch (error: any) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ error: 'Not found', message: error.message });
      return;
    }
    console.error('Error in getPublicListingDetail:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Error al obtener el listing' });
  }
};
