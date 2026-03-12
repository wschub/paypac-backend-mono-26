import { prisma } from '../config/db';
import { ROLES } from '@prisma/client';

export class RoleSectionPermissionRepository {

  async upsert(data: {
    role: ROLES;
    section_id: number;
    can_view?: boolean;
    can_create?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    can_export?: boolean;
  }) {
    return prisma.roleSectionPermission.upsert({
      where: { role_section_id: { role: data.role, section_id: data.section_id } },
      update: {
        can_view:   data.can_view,
        can_create: data.can_create,
        can_edit:   data.can_edit,
        can_delete: data.can_delete,
        can_export: data.can_export,
      },
      create: {
        role:       data.role,
        section_id: data.section_id,
        can_view:   data.can_view   ?? false,
        can_create: data.can_create ?? false,
        can_edit:   data.can_edit   ?? false,
        can_delete: data.can_delete ?? false,
        can_export: data.can_export ?? false,
      },
    });
  }

  async findByRole(role: ROLES) {
    return prisma.roleSectionPermission.findMany({
      where: { role },
      include: {
        section: {
          select: {
            id: true, name_section: true, link: true, icon: true,
            order: true, level: true, parent_id: true, is_active: true,
          },
        },
      },
      orderBy: { section: { order: 'asc' } },
    });
  }

  async findByRoleAndSection(role: ROLES, section_id: number) {
    return prisma.roleSectionPermission.findUnique({
      where: { role_section_id: { role, section_id } },
      include: { section: true },
    });
  }

  async delete(role: ROLES, section_id: number) {
    return prisma.roleSectionPermission.delete({
      where: { role_section_id: { role, section_id } },
    });
  }

  // Bulk upsert — asignar permisos de una sección a múltiples roles a la vez
  async bulkUpsert(section_id: number, permissions: {
    role: ROLES;
    can_view?: boolean;
    can_create?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    can_export?: boolean;
  }[]) {
    return prisma.$transaction(
      permissions.map(p =>
        prisma.roleSectionPermission.upsert({
          where: { role_section_id: { role: p.role, section_id } },
          update: {
            can_view:   p.can_view,
            can_create: p.can_create,
            can_edit:   p.can_edit,
            can_delete: p.can_delete,
            can_export: p.can_export,
          },
          create: {
            role: p.role,
            section_id,
            can_view:   p.can_view   ?? false,
            can_create: p.can_create ?? false,
            can_edit:   p.can_edit   ?? false,
            can_delete: p.can_delete ?? false,
            can_export: p.can_export ?? false,
          },
        })
      )
    );
  }
}