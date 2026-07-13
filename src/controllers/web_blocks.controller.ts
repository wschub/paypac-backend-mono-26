import { Request, Response } from 'express';
import { WebBlocksService } from '../services/web_blocks.service';

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

// ── Bloques (lectura para selects del dashboard) ────────────────────────────────

export const getBlocks = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ blocks: await service.getAllBlocksBasic() });
  } catch (e: any) { handle(res, e, 'getBlocks'); }
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
    const { image_url, event_id } = req.body;
    if (!image_url) { res.status(400).json({ message: 'image_url es requerido' }); return; }
    const slide = await service.addSlide(blockId, image_url, event_id ?? null);
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
