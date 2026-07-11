"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterestSchema = exports.createInterestSchema = void 0;
const zod_1 = require("zod");
exports.createInterestSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.number().int().positive(),
        subcategory_id: zod_1.z.number().int().positive().optional(),
        subgenre_id: zod_1.z.number().int().positive().optional(),
        interest_level: zod_1.z.number().int().min(1).max(5),
    }),
});
exports.updateInterestSchema = zod_1.z.object({
    body: zod_1.z.object({
        interest_level: zod_1.z.number().int().min(1).max(5),
    }),
});
