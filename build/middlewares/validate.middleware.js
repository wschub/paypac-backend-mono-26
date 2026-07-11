"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * Middleware genérico de validación para Zod v4.
 * Permite validar body, params y query.
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    message: 'Error de validación',
                    issues: error.issues, // ✅ Cambiado de `errors` → `issues`
                });
            }
            return res.status(400).json({
                message: 'Error desconocido en validación',
                error: error instanceof Error ? error.message : error,
            });
        }
    };
};
exports.validateRequest = validateRequest;
