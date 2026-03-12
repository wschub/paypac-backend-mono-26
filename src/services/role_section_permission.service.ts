import { RoleSectionPermissionRepository } from '../repositories/role_section_permission.repository';
import { SectionRepository } from '../repositories/section.repository';
import { ROLES } from '@prisma/client';

const permRepo    = new RoleSectionPermissionRepository();
const sectionRepo = new SectionRepository();

const VALID_ROLES: ROLES[] = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

export class RoleSectionPermissionService {

  async upsertPermission(
    data: {
      role: ROLES;
      section_id: number;
      can_view?: boolean;
      can_create?: boolean;
      can_edit?: boolean;
      can_delete?: boolean;
      can_export?: boolean;
    },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede gestionar permisos');

    const section = await sectionRepo.findById(data.section_id);
    if (!section) throw new Error('Sección no encontrada');

    if (!VALID_ROLES.includes(data.role)) throw new Error('Rol inválido');

    return permRepo.upsert(data);
  }

  async getPermissionsByRole(role: ROLES, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver los permisos');
    if (!VALID_ROLES.includes(role)) throw new Error('Rol inválido');
    return permRepo.findByRole(role);
  }

  async getPermissionByRoleAndSection(role: ROLES, section_id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver los permisos');
    const perm = await permRepo.findByRoleAndSection(role, section_id);
    if (!perm) throw new Error('Permiso no encontrado');
    return perm;
  }

  async deletePermission(role: ROLES, section_id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar permisos');
    const perm = await permRepo.findByRoleAndSection(role, section_id);
    if (!perm) throw new Error('Permiso no encontrado');
    return permRepo.delete(role, section_id);
  }

  async bulkUpsert(
    section_id: number,
    permissions: {
      role: ROLES;
      can_view?: boolean;
      can_create?: boolean;
      can_edit?: boolean;
      can_delete?: boolean;
      can_export?: boolean;
    }[],
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede gestionar permisos');

    const section = await sectionRepo.findById(section_id);
    if (!section) throw new Error('Sección no encontrada');

    const invalidRole = permissions.find(p => !VALID_ROLES.includes(p.role));
    if (invalidRole) throw new Error(`Rol inválido: ${invalidRole.role}`);

    return permRepo.bulkUpsert(section_id, permissions);
  }
}