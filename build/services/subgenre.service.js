"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubgenreService = void 0;
const subgenre_repository_1 = require("../repositories/subgenre.repository");
const subcategory_repository_1 = require("../repositories/subcategory.repository");
const client_1 = require("../prisma/client");
const subgenreRepo = new subgenre_repository_1.SubgenreRepository();
const subCategoryRepo = new subcategory_repository_1.SubCategoryRepository();
class SubgenreService {
    /**
     * Crear subgénero — solo PAYPAC
     */
    createSubgenre(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear subgéneros');
            }
            // Verificar que la subcategoría existe
            const subcategory = yield subCategoryRepo.findById(data.subcategory_id);
            if (!subcategory) {
                throw new Error(`La subcategoría con ID ${data.subcategory_id} no existe`);
            }
            // Validar nombre único dentro de la subcategoría
            const existing = yield subgenreRepo.findByNameAndSubCategory(data.subcategory_name, data.subcategory_id);
            if (existing) {
                throw new Error(`Ya existe el subgénero "${data.subcategory_name}" en la subcategoría "${subcategory.subcategory_name}"`);
            }
            return subgenreRepo.create({
                subcategory_name: data.subcategory_name,
                subcategory: { connect: { id: data.subcategory_id } },
            });
        });
    }
    /**
     * Listar subgéneros con filtros — todos los roles autenticados
     */
    getSubgenres(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return subgenreRepo.findAll(filters);
        });
    }
    /**
     * Subgénero por ID — todos los roles
     */
    getSubgenreById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const subgenre = yield subgenreRepo.findById(id);
            if (!subgenre) {
                throw new Error('Subgénero no encontrado');
            }
            return subgenre;
        });
    }
    /**
     * Subgéneros de una subcategoría — todos los roles
     */
    getSubgenresBySubCategory(subcategory_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const subcategory = yield subCategoryRepo.findById(subcategory_id);
            if (!subcategory) {
                throw new Error(`La subcategoría con ID ${subcategory_id} no existe`);
            }
            return subgenreRepo.findBySubCategory(subcategory_id);
        });
    }
    /**
     * Actualizar subgénero — solo PAYPAC
     */
    updateSubgenre(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar subgéneros');
            }
            const subgenre = yield subgenreRepo.findById(id);
            if (!subgenre) {
                throw new Error('Subgénero no encontrado');
            }
            const targetSubcategoryId = (_a = data.subcategory_id) !== null && _a !== void 0 ? _a : subgenre.subcategory_id;
            // Verificar subcategoría destino si se está cambiando
            if (data.subcategory_id && data.subcategory_id !== subgenre.subcategory_id) {
                const subcategory = yield subCategoryRepo.findById(data.subcategory_id);
                if (!subcategory) {
                    throw new Error(`La subcategoría con ID ${data.subcategory_id} no existe`);
                }
            }
            // Validar nombre único en la subcategoría destino (excluyendo el actual)
            if (data.subcategory_name) {
                const existing = yield subgenreRepo.findByNameAndSubCategory(data.subcategory_name, targetSubcategoryId);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe el subgénero "${data.subcategory_name}" en la subcategoría con ID ${targetSubcategoryId}`);
                }
            }
            const updateData = {};
            if (data.subcategory_name)
                updateData.subcategory_name = data.subcategory_name;
            if (data.subcategory_id)
                updateData.subcategory = { connect: { id: data.subcategory_id } };
            return subgenreRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar subgénero — solo PAYPAC
     * Valida que no tenga eventos asociados
     */
    deleteSubgenre(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar subgéneros');
            }
            const subgenre = yield subgenreRepo.findById(id);
            if (!subgenre) {
                throw new Error('Subgénero no encontrado');
            }
            const counts = subgenre._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.events) > 0) {
                throw new Error(`No se puede eliminar: el subgénero tiene ${counts.events} evento(s) asociado(s).`);
            }
            return subgenreRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     */
    getSubgenresStats(userRole, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return subgenreRepo.getStats(filters);
        });
    }
    getPublicSubgenres(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const subcategoryId = filters.subcategory_id
                ? parseInt(filters.subcategory_id)
                : undefined;
            const categoryId = filters.category_id
                ? parseInt(filters.category_id)
                : undefined;
            const where = Object.assign(Object.assign(Object.assign({}, (filters.search && {
                subcategory_name: { contains: filters.search, mode: 'insensitive' },
            })), (subcategoryId && { subcategory_id: subcategoryId })), (categoryId && { subcategory: { category_id: categoryId } }));
            const subgenres = yield client_1.prisma.subgenre.findMany({
                where,
                select: {
                    id: true,
                    subcategory_id: true,
                    subcategory_name: true,
                },
                orderBy: { subcategory_name: 'asc' },
            });
            return { data: subgenres, total: subgenres.length };
        });
    }
}
exports.SubgenreService = SubgenreService;
