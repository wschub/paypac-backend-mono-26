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
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
const client_1 = require("../prisma/client");
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
function generateUniqueSlug(baseText, excludeEventId) {
    return __awaiter(this, void 0, void 0, function* () {
        let slug = generateSlug(baseText);
        let counter = 1;
        let isUnique = false;
        while (!isUnique) {
            const existing = yield client_1.prisma.event.findFirst({
                where: Object.assign({ public_url: slug }, (excludeEventId && { id: { not: excludeEventId } })),
            });
            if (!existing) {
                isUnique = true;
            }
            else {
                slug = `${generateSlug(baseText)}-${counter}`;
                counter++;
            }
        }
        return slug;
    });
}
