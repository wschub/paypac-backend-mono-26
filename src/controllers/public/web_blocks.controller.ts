import { Request, Response } from 'express';
import { WebBlocksService } from '../../services/web_blocks.service';

const service = new WebBlocksService();

// ── WebBlockIndex ─────────────────────────────────────────────────────────────

export const getBlocks = async (req: Request, res: Response) => {
  try {
    const countryId = req.query.country_id ? Number(req.query.country_id) : undefined;
    const blocks = await service.getAll(countryId);
    res.status(200).json({ blocks });
  } catch (error: any) {
    console.error('Error in getBlocks:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch blocks' });
  }
};

export const getBlockById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const block = await service.getById(id);
    res.status(200).json({ block });
  } catch (error: any) {
    console.error('Error in getBlockById:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch block' });
  }
};

export const createBlock = async (req: Request, res: Response) => {
  try {
    const block = await service.create(req.body);
    res.status(201).json({ block });
  } catch (error: any) {
    console.error('Error in createBlock:', error);
    if (error.message.includes('ya está en uso')) {
      return res.status(409).json({ error: 'Conflict', message: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to create block' });
  }
};

export const updateBlock = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const block = await service.update(id, req.body);
    res.status(200).json({ block });
  } catch (error: any) {
    console.error('Error in updateBlock:', error);
    if (error.message.includes('ya está en uso')) {
      return res.status(409).json({ error: 'Conflict', message: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update block' });
  }
};

export const deleteBlock = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await service.delete(id);
    res.status(200).json({ message: 'Bloque eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error in deleteBlock:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete block' });
  }
};

// ── WebBlockEvents ────────────────────────────────────────────────────────────

export const addEventToBlock = async (req: Request, res: Response) => {
  try {
    const blockId = parseInt(req.params.id as string);
    const { event_id } = req.body;
    const entry = await service.addEvent(blockId, event_id);
    res.status(201).json({ entry });
  } catch (error: any) {
    console.error('Error in addEventToBlock:', error);
    if (error.message.includes('ya está')) {
      return res.status(400).json({ error: 'Bad request', message: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to add event' });
  }
};

export const removeEventFromBlock = async (req: Request, res: Response) => {
  try {
    const blockId = parseInt(req.params.id as string);
    const eventId = parseInt(req.params.eventId as string);
    await service.removeEvent(blockId, eventId);
    res.status(200).json({ message: 'Evento eliminado del bloque' });
  } catch (error: any) {
    console.error('Error in removeEventFromBlock:', error);
    if (error.message.includes('no encontrado') || error.message.includes('no está')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to remove event' });
  }
};

// ── WebBlockSlideImgs ─────────────────────────────────────────────────────────

export const addSlideToBlock = async (req: Request, res: Response) => {
  try {
    const blockId = parseInt(req.params.id as string);
    const { image_url, event_id } = req.body;
    const slide = await service.addSlide(blockId, image_url, event_id ?? null);
    res.status(201).json({ slide });
  } catch (error: any) {
    console.error('Error in addSlideToBlock:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to add slide' });
  }
};

export const updateSlide = async (req: Request, res: Response) => {
  try {
    const blockId = parseInt(req.params.id as string);
    const slideId = parseInt(req.params.slideId as string);
    const slide = await service.updateSlide(blockId, slideId, req.body);
    res.status(200).json({ slide });
  } catch (error: any) {
    console.error('Error in updateSlide:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to update slide' });
  }
};

export const removeSlide = async (req: Request, res: Response) => {
  try {
    const blockId = parseInt(req.params.id as string);
    const slideId = parseInt(req.params.slideId as string);
    await service.removeSlide(blockId, slideId);
    res.status(200).json({ message: 'Slide eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error in removeSlide:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to remove slide' });
  }
};
