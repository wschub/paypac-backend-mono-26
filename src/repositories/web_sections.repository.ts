import { prisma } from '../prisma/client';

const groupInclude = {
  sections: {
    orderBy: { section_order: 'asc' as const },
    include: { section_type: true },
  },
} as const;

const sectionInclude = {
  group: true,
  section_type: true,
} as const;

// ─── WebSectionsTypes ─────────────────────────────────────────────────────────

export class WebSectionsTypesRepository {
  findAll() {
    return prisma.webSectionsTypes.findMany({ orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.webSectionsTypes.findUnique({ where: { id } });
  }

  create(type_name: string) {
    return prisma.webSectionsTypes.create({ data: { type_name } });
  }

  update(id: number, type_name: string) {
    return prisma.webSectionsTypes.update({ where: { id }, data: { type_name } });
  }

  delete(id: number) {
    return prisma.webSectionsTypes.delete({ where: { id } });
  }
}

// ─── WebSectionsGroups ────────────────────────────────────────────────────────

export class WebSectionsGroupsRepository {
  findAll(lang?: string) {
    return prisma.webSectionsGroups.findMany({
      where: lang ? { group_lang: lang } : undefined,
      orderBy: { group_order: 'asc' },
      include: groupInclude,
    });
  }

  findById(id: number) {
    return prisma.webSectionsGroups.findUnique({
      where: { id },
      include: groupInclude,
    });
  }

  create(data: { group_name: string; group_order?: number; group_lang?: string }) {
    return prisma.webSectionsGroups.create({
      data,
      include: groupInclude,
    });
  }

  update(id: number, data: { group_name?: string; group_order?: number; group_lang?: string }) {
    return prisma.webSectionsGroups.update({
      where: { id },
      data,
      include: groupInclude,
    });
  }

  delete(id: number) {
    return prisma.webSectionsGroups.delete({ where: { id } });
  }
}

// ─── WebSections ──────────────────────────────────────────────────────────────

export class WebSectionsRepository {
  findAll(lang?: string) {
    return prisma.webSections.findMany({
      where: lang ? { lang } : undefined,
      orderBy: [{ group_id: 'asc' }, { section_order: 'asc' }],
      include: sectionInclude,
    });
  }

  findById(id: number) {
    return prisma.webSections.findUnique({
      where: { id },
      include: sectionInclude,
    });
  }

  findByUrl(menu_url: string) {
    return prisma.webSections.findFirst({
      where: { menu_url },
      include: sectionInclude,
    });
  }

  create(data: {
    lang?: string;
    group_id: number;
    section_order?: number;
    type_id: number;
    menu_label: string;
    title?: string;
    content?: string;
    menu_url?: string;
  }) {
    return prisma.webSections.create({
      data,
      include: sectionInclude,
    });
  }

  update(
    id: number,
    data: {
      lang?: string;
      group_id?: number;
      section_order?: number;
      type_id?: number;
      menu_label?: string;
      title?: string | null;
      content?: string | null;
      menu_url?: string | null;
    }
  ) {
    return prisma.webSections.update({
      where: { id },
      data,
      include: sectionInclude,
    });
  }

  delete(id: number) {
    return prisma.webSections.delete({ where: { id } });
  }
}
