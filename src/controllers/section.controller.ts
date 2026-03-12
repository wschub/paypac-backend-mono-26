import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';

const sectionService = new SectionService();

export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await sectionService.createSection(req.body, req.user!.role);
    res.status(201).json({ message: 'Sección creada exitosamente', section: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getAllSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await sectionService.getAllSections(req.user!.role);
    res.status(200).json({ total: sections.length, sections });
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await sectionService.getSectionById(Number(req.params.id), req.user!.role);
    res.status(200).json(section);
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('Solo PAYPAC') ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};

// GET /api/sections/menu — usa el rol del token
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const menu = await sectionService.getMenuForRole(req.user!.role);
    res.status(200).json({ menu });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await sectionService.updateSection(Number(req.params.id), req.body, req.user!.role);
    res.status(200).json({ message: 'Sección actualizada exitosamente', section: result });
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    await sectionService.deleteSection(Number(req.params.id), req.user!.role);
    res.status(200).json({ message: 'Sección desactivada exitosamente' });
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const reorderSections = async (req: Request, res: Response): Promise<void> => {
  try {
    await sectionService.reorderSections(req.body.items, req.user!.role);
    res.status(200).json({ message: 'Orden actualizado exitosamente' });
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};