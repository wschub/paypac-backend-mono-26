"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCitiesQuerySchema = void 0;
const zod_1 = require("zod");
exports.getPublicCitiesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        country_id: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
