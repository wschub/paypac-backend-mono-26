import { Request, Response } from 'express';
import { WebBlockType } from '@prisma/client';
import { WebBlocksService } from '../services/web_blocks.service';

// País por defecto para bloques nuevos (Colombia)
const DEFAULT_BLOCK_COUNTRY_ID = 3;

// Genera un identificador único a partir del título (o 'bloque') + sufijo temporal
function generateIdentifier(title: string): string {
  const slug = String(title)
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'bloque';
  return `${slug}-${Date.now().toString(36)}`;
}

/**
 * Controlador de dashboard (PAYPAC) para bloques del index y sus slides.
 * Reutiliza el mismo WebBlocksService que el router público, pero bajo
 * autenticación de dashboard (bearer + rol PAYPAC) en /api/web-blocks.
 */
const service = new WebBlocksService();

const handle = (res: Response, e: any, ctx: string) => {
  console.error(`[WebBlocks:dashboard] ${ctx}:`, e.message);
  if (e.message?.includes('no encontrado')) {
    return res.status(404).json({ message: e.message });
  }
  if (e.message?.includes('ya está') || e.message?.includes('en uso')) {
    return res.status(409).json({ message: e.message });
  }
  return res.status(500).json({ message: e.message || 'Error interno' });
};

// ── Bloques ─────────────────────────────────────────────────────────────────────

// Datos básicos (para selects, p.ej. el formulario de slides)
export const getBlocks = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ blocks: await service.getAllBlocksBasic() });
  } catch (e: any) { handle(res, e, 'getBlocks'); }
};

// Bloques completos (con eventos y slides), id asc — para la página "Bloques del Index"
export const getBlocksFull = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ blocks: await service.getAllFull() });
  } catch (e: any) { handle(res, e, 'getBlocksFull'); }
};

export const createBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, block_order, block_active, type, block_identifier, country_id,
      banner_img, banner_text, banner_link, block_config, bkg_color,
    } = req.body;

    if (!title) { res.status(400).json({ message: 'title es requerido' }); return; }

    // Campos que la tabla exige pero el form mínimo no pide: se resuelven con defaults
    const block = await service.create({
      country_id:       country_id ? +country_id : DEFAULT_BLOCK_COUNTRY_ID,
      title,
      type:             (type || 'CUSTOM') as WebBlockType,
      block_order:      block_order ?? 1,
      block_identifier: block_identifier?.trim() || generateIdentifier(title),
      block_active:     block_active ?? 1,
      banner_img, banner_text, banner_link, block_config, bkg_color,
    });
    res.status(201).json({ block });
  } catch (e: any) { handle(res, e, 'createBlock'); }
};

export const updateBlock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const block = await service.update(id, req.body);
    res.status(200).json({ block });
  } catch (e: any) { handle(res, e, 'updateBlock'); }
};

// ── Eventos del bloque ────────────────────────────────────────────────────────

export const addEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockId = parseInt(req.params.id as string);
    const { event_id } = req.body;
    if (!event_id) { res.status(400).json({ message: 'event_id es requerido' }); return; }
    const link = await service.addEvent(blockId, +event_id);
    res.status(201).json({ event: link });
  } catch (e: any) { handle(res, e, 'addEvent'); }
};

export const removeEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockId = parseInt(req.params.id as string);
    const eventId = parseInt(req.params.eventId as string);
    await service.removeEvent(blockId, eventId);
    res.status(200).json({ message: 'Evento quitado del bloque' });
  } catch (e: any) { handle(res, e, 'removeEvent'); }
};

// ── Slides ──────────────────────────────────────────────────────────────────────

export const getSlides = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ slides: await service.getAllSlides() });
  } catch (e: any) { handle(res, e, 'getSlides'); }
};

export const addSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockId = parseInt(req.params.id as string);
    const { image_url, event_id, link_url } = req.body;
    if (!image_url) { res.status(400).json({ message: 'image_url es requerido' }); return; }
    const slide = await service.addSlide(blockId, image_url, event_id ?? null, link_url ?? null);
    res.status(201).json({ slide });
  } catch (e: any) { handle(res, e, 'addSlide'); }
};

export const updateSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockId = parseInt(req.params.id as string);
    const slideId = parseInt(req.params.slideId as string);
    const slide = await service.updateSlide(blockId, slideId, req.body);
    res.status(200).json({ slide });
  } catch (e: any) { handle(res, e, 'updateSlide'); }
};

export const removeSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockId = parseInt(req.params.id as string);
    const slideId = parseInt(req.params.slideId as string);
    await service.removeSlide(blockId, slideId);
    res.status(200).json({ message: 'Slide eliminado' });
  } catch (e: any) { handle(res, e, 'removeSlide'); }
};
