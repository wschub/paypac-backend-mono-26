import { SectionRepository } from '../repositories/section.repository';
import { Prisma } from '@prisma/client';

const sectionRepo = new SectionRepository();

export class SectionService {

  async createSection(data: Prisma.SectionUncheckedCreateInput, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede gestionar secciones');
    return sectionRepo.create(data);
  }

  async getAllSections(userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver todas las secciones');
    return sectionRepo.findAll();
  }

  async getSectionById(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver esta información');
    const section = await sectionRepo.findById(id);
    if (!section) throw new Error('Sección no encontrada');
    return section;
  }

  // Menú dinámico para el usuario autenticado
  async getMenuForRole(role: string) {
    const sections = await sectionRepo.findMenuByRole(role);

    // Aplanar permisos al nivel del item para facilitar consumo en frontend
    return sections.map(section => ({
      id:           section.id,
      name_section: section.name_section,
      icon:         section.icon,
      link:         section.link,
      order:        section.section_order,
      level:        section.level,
      ...flattenPermissions(section.rolePermissions[0]),
      children: section.children.map(child => ({
        id:           child.id,
        name_section: child.name_section,
        icon:         child.icon,
        link:         child.link,
        order:        child.section_order,
        level:        child.level,
        ...flattenPermissions(child.rolePermissions[0]),
      })),
    }));
  }

  async updateSection(id: number, data: Prisma.SectionUpdateInput, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede modificar secciones');
    const section = await sectionRepo.findById(id);
    if (!section) throw new Error('Sección no encontrada');
    return sectionRepo.update(id, data);
  }

  async deleteSection(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar secciones');
    const section = await sectionRepo.findById(id);
    if (!section) throw new Error('Sección no encontrada');
    return sectionRepo.delete(id); // soft delete
  }

  async reorderSections(items: { id: number; order: number }[], userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede reordenar secciones');
    return sectionRepo.reorder(items);
  }
}

function flattenPermissions(perm: any) {
  return {
    can_view:   perm?.can_view   ?? false,
    can_create: perm?.can_create ?? false,
    can_edit:   perm?.can_edit   ?? false,
    can_delete: perm?.can_delete ?? false,
    can_export: perm?.can_export ?? false,
  };
}