import { Request, Response } from 'express';
import { RoleSectionPermissionService } from '../services/role_section_permission.service';
import { ROLES } from '@prisma/client';

const permService = new RoleSectionPermissionService();

export const upsertPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await permService.upsertPermission(req.body, req.user!.role);
    res.status(200).json({ message: 'Permiso actualizado exitosamente', permission: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getPermissionsByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as ROLES;
    const perms = await permService.getPermissionsByRole(role, req.user!.role);
    res.status(200).json({ total: perms.length, permissions: perms });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getPermissionByRoleAndSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const role       = req.params.role as ROLES;
    const section_id = Number(req.params.sectionId);
    const perm = await permService.getPermissionByRoleAndSection(role, section_id, req.user!.role);
    res.status(200).json(perm);
  } catch (err: any) {
    const status = err.message.includes('no encontrado') ? 404
                 : err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const role       = req.params.role as ROLES;
    const section_id = Number(req.params.sectionId);
    await permService.deletePermission(role, section_id, req.user!.role);
    res.status(200).json({ message: 'Permiso eliminado exitosamente' });
  } catch (err: any) {
    const status = err.message.includes('no encontrado') ? 404
                 : err.message.includes('Solo PAYPAC') ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const bulkUpsertPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const section_id  = Number(req.params.sectionId);
    const { permissions } = req.body;
    const result = await permService.bulkUpsert(section_id, permissions, req.user!.role);
    res.status(200).json({ message: 'Permisos actualizados exitosamente', permissions: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};