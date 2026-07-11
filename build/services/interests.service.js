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
exports.InterestsService = void 0;
const client_1 = require("../prisma/client");
class InterestsService {
    getMyInterests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const interests = yield client_1.prisma.userInterest.findMany({
                where: { user_id: userId },
                include: {
                    category: { select: { id: true, category_name: true } },
                    subcategory: { select: { id: true, subcategory_name: true } },
                    subgenre: { select: { id: true, subcategory_name: true } },
                },
                orderBy: [{ interest_level: 'desc' }, { createdAt: 'desc' }],
            });
            return interests.map((interest) => {
                var _a, _b, _c;
                return ({
                    id: interest.id,
                    category_id: interest.category_id,
                    category_name: ((_a = interest.category) === null || _a === void 0 ? void 0 : _a.category_name) || null,
                    subcategory_id: interest.subcategory_id,
                    subcategory_name: ((_b = interest.subcategory) === null || _b === void 0 ? void 0 : _b.subcategory_name) || null,
                    subgenre_id: interest.subgenre_id,
                    subgenre_name: ((_c = interest.subgenre) === null || _c === void 0 ? void 0 : _c.subcategory_name) || null,
                    interest_level: interest.interest_level,
                    source: interest.source,
                    createdAt: interest.createdAt,
                });
            });
        });
    }
    createInterest(userId, categoryId, subcategoryId, subgenreId, interestLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield client_1.prisma.category.findUnique({ where: { id: categoryId } });
            if (!category)
                throw new Error('Categoría no encontrada');
            if (subcategoryId) {
                const subcategory = yield client_1.prisma.subCategory.findUnique({ where: { id: subcategoryId } });
                if (!subcategory)
                    throw new Error('Subcategoría no encontrada');
            }
            if (subgenreId) {
                const subgenre = yield client_1.prisma.subgenre.findUnique({ where: { id: subgenreId } });
                if (!subgenre)
                    throw new Error('Subgénero no encontrado');
            }
            const existing = yield client_1.prisma.userInterest.findFirst({
                where: {
                    user_id: userId,
                    category_id: categoryId,
                    subcategory_id: subcategoryId !== null && subcategoryId !== void 0 ? subcategoryId : null,
                    subgenre_id: subgenreId !== null && subgenreId !== void 0 ? subgenreId : null,
                },
            });
            if (existing)
                throw new Error('Ya tienes este interés registrado');
            return client_1.prisma.userInterest.create({
                data: {
                    user_id: userId,
                    category_id: categoryId,
                    subcategory_id: subcategoryId !== null && subcategoryId !== void 0 ? subcategoryId : null,
                    subgenre_id: subgenreId !== null && subgenreId !== void 0 ? subgenreId : null,
                    interest_level: interestLevel,
                    source: 'MANUAL',
                },
            });
        });
    }
    updateInterest(userId, interestId, interestLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const interest = yield client_1.prisma.userInterest.findFirst({
                where: { id: interestId, user_id: userId },
            });
            if (!interest)
                throw new Error('Interés no encontrado');
            return client_1.prisma.userInterest.update({
                where: { id: interestId },
                data: { interest_level: interestLevel },
            });
        });
    }
    deleteInterest(userId, interestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const interest = yield client_1.prisma.userInterest.findFirst({
                where: { id: interestId, user_id: userId },
            });
            if (!interest)
                throw new Error('Interés no encontrado');
            yield client_1.prisma.userInterest.delete({ where: { id: interestId } });
        });
    }
    recordInterestFromPurchase(userId, categoryId, subcategoryId, subgenreId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield client_1.prisma.userInterest.findFirst({
                where: {
                    user_id: userId,
                    category_id: categoryId,
                    subcategory_id: subcategoryId !== null && subcategoryId !== void 0 ? subcategoryId : null,
                    subgenre_id: subgenreId !== null && subgenreId !== void 0 ? subgenreId : null,
                },
            });
            if (existing) {
                if (existing.interest_level < 5) {
                    yield client_1.prisma.userInterest.update({
                        where: { id: existing.id },
                        data: {
                            interest_level: Math.min(existing.interest_level + 1, 5),
                            source: 'PURCHASE',
                        },
                    });
                }
            }
            else {
                yield client_1.prisma.userInterest.create({
                    data: {
                        user_id: userId,
                        category_id: categoryId,
                        subcategory_id: subcategoryId !== null && subcategoryId !== void 0 ? subcategoryId : null,
                        subgenre_id: subgenreId !== null && subgenreId !== void 0 ? subgenreId : null,
                        interest_level: 1,
                        source: 'PURCHASE',
                    },
                });
            }
        });
    }
}
exports.InterestsService = InterestsService;
