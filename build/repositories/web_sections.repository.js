"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSectionsRepository = exports.WebSectionsGroupsRepository = exports.WebSectionsTypesRepository = void 0;
const client_1 = require("../prisma/client");
const groupInclude = {
    sections: {
        orderBy: { section_order: 'asc' },
        include: { section_type: true },
    },
};
const sectionInclude = {
    group: true,
    section_type: true,
};
// ─── WebSectionsTypes ─────────────────────────────────────────────────────────
class WebSectionsTypesRepository {
    findAll() {
        return client_1.prisma.webSectionsTypes.findMany({ orderBy: { id: 'asc' } });
    }
    findById(id) {
        return client_1.prisma.webSectionsTypes.findUnique({ where: { id } });
    }
    create(type_name) {
        return client_1.prisma.webSectionsTypes.create({ data: { type_name } });
    }
    update(id, type_name) {
        return client_1.prisma.webSectionsTypes.update({ where: { id }, data: { type_name } });
    }
    delete(id) {
        return client_1.prisma.webSectionsTypes.delete({ where: { id } });
    }
}
exports.WebSectionsTypesRepository = WebSectionsTypesRepository;
// ─── WebSectionsGroups ────────────────────────────────────────────────────────
class WebSectionsGroupsRepository {
    findAll(lang) {
        return client_1.prisma.webSectionsGroups.findMany({
            where: lang ? { group_lang: lang } : undefined,
            orderBy: { group_order: 'asc' },
            include: groupInclude,
        });
    }
    findById(id) {
        return client_1.prisma.webSectionsGroups.findUnique({
            where: { id },
            include: groupInclude,
        });
    }
    create(data) {
        return client_1.prisma.webSectionsGroups.create({
            data,
            include: groupInclude,
        });
    }
    update(id, data) {
        return client_1.prisma.webSectionsGroups.update({
            where: { id },
            data,
            include: groupInclude,
        });
    }
    delete(id) {
        return client_1.prisma.webSectionsGroups.delete({ where: { id } });
    }
}
exports.WebSectionsGroupsRepository = WebSectionsGroupsRepository;
// ─── WebSections ──────────────────────────────────────────────────────────────
class WebSectionsRepository {
    findAll(lang) {
        return client_1.prisma.webSections.findMany({
            where: lang ? { lang } : undefined,
            orderBy: [{ group_id: 'asc' }, { section_order: 'asc' }],
            include: sectionInclude,
        });
    }
    findById(id) {
        return client_1.prisma.webSections.findUnique({
            where: { id },
            include: sectionInclude,
        });
    }
    findByUrl(menu_url) {
        return client_1.prisma.webSections.findFirst({
            where: { menu_url },
            include: sectionInclude,
        });
    }
    create(data) {
        return client_1.prisma.webSections.create({
            data,
            include: sectionInclude,
        });
    }
    update(id, data) {
        return client_1.prisma.webSections.update({
            where: { id },
            data,
            include: sectionInclude,
        });
    }
    delete(id) {
        return client_1.prisma.webSections.delete({ where: { id } });
    }
}
exports.WebSectionsRepository = WebSectionsRepository;
