import {
  WebSectionsTypesRepository,
  WebSectionsGroupsRepository,
  WebSectionsRepository,
} from '../repositories/web_sections.repository';

const typesRepo = new WebSectionsTypesRepository();
const groupsRepo = new WebSectionsGroupsRepository();
const sectionsRepo = new WebSectionsRepository();

export class WebSectionsService {

  // ── Types ──────────────────────────────────────────────────────────────────

  getTypes() { return typesRepo.findAll(); }

  getTypeById(id: number) { return typesRepo.findById(id); }

  createType(type_name: string) { return typesRepo.create(type_name.toUpperCase()); }

  updateType(id: number, type_name: string) {
    return typesRepo.update(id, type_name.toUpperCase());
  }

  deleteType(id: number) { return typesRepo.delete(id); }

  // ── Groups ─────────────────────────────────────────────────────────────────

  getGroups(lang?: string) { return groupsRepo.findAll(lang); }

  getGroupById(id: number) { return groupsRepo.findById(id); }

  createGroup(data: { group_name: string; group_order?: number; group_lang?: string }) {
    return groupsRepo.create(data);
  }

  updateGroup(id: number, data: { group_name?: string; group_order?: number; group_lang?: string }) {
    return groupsRepo.update(id, data);
  }

  deleteGroup(id: number) { return groupsRepo.delete(id); }

  // ── Sections ───────────────────────────────────────────────────────────────

  getSections(lang?: string) { return sectionsRepo.findAll(lang); }

  getSectionById(id: number) { return sectionsRepo.findById(id); }

  getSectionByUrl(url: string) { return sectionsRepo.findByUrl(url); }

  createSection(data: {
    lang?: string;
    group_id: number;
    section_order?: number;
    type_id: number;
    menu_label: string;
    title?: string;
    content?: string;
    menu_url?: string;
  }) {
    return sectionsRepo.create(data);
  }

  updateSection(
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
    return sectionsRepo.update(id, data);
  }

  deleteSection(id: number) { return sectionsRepo.delete(id); }

  // ── Public: groups with nested sections ───────────────────────────────────

  getPublicNav(lang = 'ES') { return groupsRepo.findAll(lang); }
}
