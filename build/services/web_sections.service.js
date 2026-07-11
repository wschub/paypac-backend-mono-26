"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSectionsService = void 0;
const web_sections_repository_1 = require("../repositories/web_sections.repository");
const typesRepo = new web_sections_repository_1.WebSectionsTypesRepository();
const groupsRepo = new web_sections_repository_1.WebSectionsGroupsRepository();
const sectionsRepo = new web_sections_repository_1.WebSectionsRepository();
class WebSectionsService {
    // ── Types ──────────────────────────────────────────────────────────────────
    getTypes() { return typesRepo.findAll(); }
    getTypeById(id) { return typesRepo.findById(id); }
    createType(type_name) { return typesRepo.create(type_name.toUpperCase()); }
    updateType(id, type_name) {
        return typesRepo.update(id, type_name.toUpperCase());
    }
    deleteType(id) { return typesRepo.delete(id); }
    // ── Groups ─────────────────────────────────────────────────────────────────
    getGroups(lang) { return groupsRepo.findAll(lang); }
    getGroupById(id) { return groupsRepo.findById(id); }
    createGroup(data) {
        return groupsRepo.create(data);
    }
    updateGroup(id, data) {
        return groupsRepo.update(id, data);
    }
    deleteGroup(id) { return groupsRepo.delete(id); }
    // ── Sections ───────────────────────────────────────────────────────────────
    getSections(lang) { return sectionsRepo.findAll(lang); }
    getSectionById(id) { return sectionsRepo.findById(id); }
    getSectionByUrl(url) { return sectionsRepo.findByUrl(url); }
    createSection(data) {
        return sectionsRepo.create(data);
    }
    updateSection(id, data) {
        return sectionsRepo.update(id, data);
    }
    deleteSection(id) { return sectionsRepo.delete(id); }
    // ── Public: groups with nested sections ───────────────────────────────────
    getPublicNav(lang = 'ES') { return groupsRepo.findAll(lang); }
}
exports.WebSectionsService = WebSectionsService;
