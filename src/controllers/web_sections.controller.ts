import { Request, Response } from 'express';
import { WebSectionsService } from '../services/web_sections.service';

const svc = new WebSectionsService();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json(data);
const err = (res: Response, msg: string, status = 400) => res.status(status).json({ message: msg });

function handleError(res: Response, e: any, context: string) {
  console.error(`[WebSections] ${context}:`, e.message);
  if (e.code === 'P2025') return err(res, 'Registro no encontrado', 404);
  if (e.code === 'P2002') return err(res, 'Ya existe un registro con ese valor único', 409);
  return err(res, e.message || 'Error interno', 500);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export const getTypes = async (_req: Request, res: Response): Promise<void> => {
  try { ok(res, await svc.getTypes()); } catch (e: any) { handleError(res, e, 'getTypes'); }
};

export const createType = async (req: Request, res: Response): Promise<void> => {
  const { type_name } = req.body;
  if (!type_name) { err(res, 'type_name es requerido'); return; }
  try { ok(res, await svc.createType(type_name), 201); } catch (e: any) { handleError(res, e, 'createType'); }
};

export const updateType = async (req: Request, res: Response): Promise<void> => {
  const { type_name } = req.body;
  if (!type_name) { err(res, 'type_name es requerido'); return; }
  try { ok(res, await svc.updateType(+req.params.id, type_name)); } catch (e: any) { handleError(res, e, 'updateType'); }
};

export const deleteType = async (req: Request, res: Response): Promise<void> => {
  try { await svc.deleteType(+req.params.id); ok(res, { message: 'Tipo eliminado' }); } catch (e: any) { handleError(res, e, 'deleteType'); }
};

// ─── Groups ───────────────────────────────────────────────────────────────────

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try { ok(res, await svc.getGroups(req.query.lang as string | undefined)); } catch (e: any) { handleError(res, e, 'getGroups'); }
};

export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await svc.getGroupById(+req.params.id);
    if (!group) { err(res, 'Grupo no encontrado', 404); return; }
    ok(res, group);
  } catch (e: any) { handleError(res, e, 'getGroupById'); }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const { group_name, group_order, group_lang } = req.body;
  if (!group_name) { err(res, 'group_name es requerido'); return; }
  try { ok(res, await svc.createGroup({ group_name, group_order, group_lang }), 201); } catch (e: any) { handleError(res, e, 'createGroup'); }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  const { group_name, group_order, group_lang } = req.body;
  try { ok(res, await svc.updateGroup(+req.params.id, { group_name, group_order, group_lang })); } catch (e: any) { handleError(res, e, 'updateGroup'); }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try { await svc.deleteGroup(+req.params.id); ok(res, { message: 'Grupo eliminado' }); } catch (e: any) { handleError(res, e, 'deleteGroup'); }
};

// ─── Sections ─────────────────────────────────────────────────────────────────

export const getSections = async (req: Request, res: Response): Promise<void> => {
  try { ok(res, await svc.getSections(req.query.lang as string | undefined)); } catch (e: any) { handleError(res, e, 'getSections'); }
};

export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await svc.getSectionById(+req.params.id);
    if (!section) { err(res, 'Sección no encontrada', 404); return; }
    ok(res, section);
  } catch (e: any) { handleError(res, e, 'getSectionById'); }
};

export const createSection = async (req: Request, res: Response): Promise<void> => {
  const { lang, group_id, section_order, type_id, menu_label, title, content, menu_url } = req.body;
  if (!group_id || !type_id || !menu_label) { err(res, 'group_id, type_id y menu_label son requeridos'); return; }
  try { ok(res, await svc.createSection({ lang, group_id: +group_id, section_order, type_id: +type_id, menu_label, title, content, menu_url }), 201); } catch (e: any) { handleError(res, e, 'createSection'); }
};

export const updateSection = async (req: Request, res: Response): Promise<void> => {
  const { lang, group_id, section_order, type_id, menu_label, title, content, menu_url } = req.body;
  try {
    ok(res, await svc.updateSection(+req.params.id, {
      lang,
      ...(group_id !== undefined && { group_id: +group_id }),
      section_order,
      ...(type_id !== undefined && { type_id: +type_id }),
      menu_label, title, content, menu_url,
    }));
  } catch (e: any) { handleError(res, e, 'updateSection'); }
};

export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try { await svc.deleteSection(+req.params.id); ok(res, { message: 'Sección eliminada' }); } catch (e: any) { handleError(res, e, 'deleteSection'); }
};

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublicNav = async (req: Request, res: Response): Promise<void> => {
  try { ok(res, await svc.getPublicNav((req.query.lang as string) || 'ES')); } catch (e: any) { handleError(res, e, 'getPublicNav'); }
};

export const getPublicSectionByUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await svc.getSectionByUrl(decodeURIComponent(req.params.url as string));
    if (!section) { err(res, 'Página no encontrada', 404); return; }
    ok(res, section);
  } catch (e: any) { handleError(res, e, 'getPublicSectionByUrl'); }
};
