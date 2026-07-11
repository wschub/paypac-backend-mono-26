"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticatePublicWeb_1 = require("../../middlewares/authenticatePublicWeb");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const web_blocks_validation_1 = require("../../validators/web_blocks.validation");
const web_blocks_controller_1 = require("../../controllers/public/web_blocks.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren X-Web-API-Key
router.use(authenticatePublicWeb_1.authenticatePublicWeb);
// ── WebBlockIndex ─────────────────────────────────────────────────────────────
// GET    /api/public/web-blocks?country_id=1   Lista de bloques
// POST   /api/public/web-blocks                Crear bloque
// GET    /api/public/web-blocks/:id            Obtener bloque con eventos y slides
// PUT    /api/public/web-blocks/:id            Actualizar bloque
// DELETE /api/public/web-blocks/:id            Eliminar bloque (cascade)
router.get('/', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.getBlocksQuerySchema), web_blocks_controller_1.getBlocks);
router.post('/', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.createBlockSchema), web_blocks_controller_1.createBlock);
router.get('/:id', web_blocks_controller_1.getBlockById);
router.put('/:id', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.updateBlockSchema), web_blocks_controller_1.updateBlock);
router.delete('/:id', web_blocks_controller_1.deleteBlock);
// ── WebBlockEvents ────────────────────────────────────────────────────────────
// POST   /api/public/web-blocks/:id/events/:eventId   Agregar evento al bloque
// DELETE /api/public/web-blocks/:id/events/:eventId   Quitar evento del bloque
router.post('/:id/events', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.addEventSchema), web_blocks_controller_1.addEventToBlock);
router.delete('/:id/events/:eventId', web_blocks_controller_1.removeEventFromBlock);
// ── WebBlockSlideImgs ─────────────────────────────────────────────────────────
// POST   /api/public/web-blocks/:id/slides             Agregar slide
// PUT    /api/public/web-blocks/:id/slides/:slideId    Actualizar slide
// DELETE /api/public/web-blocks/:id/slides/:slideId    Eliminar slide
router.post('/:id/slides', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.addSlideSchema), web_blocks_controller_1.addSlideToBlock);
router.put('/:id/slides/:slideId', (0, validate_middleware_1.validateRequest)(web_blocks_validation_1.updateSlideSchema), web_blocks_controller_1.updateSlide);
router.delete('/:id/slides/:slideId', web_blocks_controller_1.removeSlide);
exports.default = router;
