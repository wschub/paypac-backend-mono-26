import { Request, Response } from 'express';
import { TicketSaleService } from '../services/ticket_sale.service';

const saleService = new TicketSaleService();

export const createListing = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id as string);
    const sellerId = (req as any).user.id;
    const listing = await saleService.createListing(ticketId, sellerId, req.body);
    res.status(201).json({ listing });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const cancelListing = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const sellerId  = (req as any).user.id;
    const result = await saleService.cancelListing(listingId, sellerId);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getMyListings = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user.id;
    const listings = await saleService.getMyListings(sellerId);
    res.status(200).json({ listings });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const placeOffer = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const buyerId   = (req as any).user.id;
    const { amount } = req.body;
    const offer = await saleService.placeOffer(listingId, buyerId, amount);
    res.status(201).json({ offer });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getOffers = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const sellerId  = (req as any).user.id;
    const offers = await saleService.getOffers(listingId, sellerId);
    res.status(200).json({ offers });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const acceptOffer = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const offerId   = parseInt(req.params.offerId as string);
    const sellerId  = (req as any).user.id;
    const result = await saleService.acceptOffer(listingId, offerId, sellerId);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

/**
 * POST /api/ticket-sales/:listingId/purchase
 * Crea la Invoice de reventa (RSL-). El cliente luego paga con
 * POST /api/transactions/process usando el invoice_id retornado.
 */
export const purchaseListing = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const buyerId   = (req as any).user.id;
    const result = await saleService.purchaseListing(listingId, buyerId, req.body);
    res.status(201).json({
      invoice: result.invoice,
      price:   result.price,
      message: 'Invoice de reventa creada. Procede al pago.',
    });
  } catch (error: any) {
    _handleError(res, error);
  }
};

/**
 * GET /api/ticket-sales/event/:eventId — listings activos del evento (autenticado)
 */
export const getListingsByEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId as string);
    const result = await saleService.getActiveListingsByEvent(eventId);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

/**
 * GET /api/ticket-sales/:listingId — detalle de un listing (autenticado)
 */
export const getListingDetail = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId as string);
    const listing = await saleService.getListingPublicDetail(listingId);
    res.status(200).json({ listing });
  } catch (error: any) {
    _handleError(res, error);
  }
};

function _handleError(res: Response, error: any) {
  console.error('TicketSale error:', error);
  const msg: string = error.message ?? '';
  if (msg.includes('no encontrad')) return res.status(404).json({ error: 'Not found', message: msg });
  if (msg.includes('permiso') || msg.includes('dueño') || msg.includes('Solo el')) {
    return res.status(403).json({ error: 'Forbidden', message: msg });
  }
  res.status(409).json({ error: 'Conflict', message: msg });
}
