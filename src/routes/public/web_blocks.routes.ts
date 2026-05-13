import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  createBlockSchema,
  updateBlockSchema,
  addEventSchema,
  addSlideSchema,
  updateSlideSchema,
  getBlocksQuerySchema,
} from '../../validators/web_blocks.validation';
import {
  getBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  addEventToBlock,
  removeEventFromBlock,
  addSlideToBlock,
  updateSlide,
  removeSlide,
} from '../../controllers/public/web_blocks.controller';

const router = Router();

// Todas las rutas requieren X-Web-API-Key
router.use(authenticatePublicWeb);

// ── WebBlockIndex ─────────────────────────────────────────────────────────────
// GET    /api/public/web-blocks?country_id=1   Lista de bloques
// POST   /api/public/web-blocks                Crear bloque
// GET    /api/public/web-blocks/:id            Obtener bloque con eventos y slides
// PUT    /api/public/web-blocks/:id            Actualizar bloque
// DELETE /api/public/web-blocks/:id            Eliminar bloque (cascade)

router.get('/', validateRequest(getBlocksQuerySchema), getBlocks);
router.post('/', validateRequest(createBlockSchema), createBlock);
router.get('/:id', getBlockById);
router.put('/:id', validateRequest(updateBlockSchema), updateBlock);
router.delete('/:id', deleteBlock);

// ── WebBlockEvents ────────────────────────────────────────────────────────────
// POST   /api/public/web-blocks/:id/events/:eventId   Agregar evento al bloque
// DELETE /api/public/web-blocks/:id/events/:eventId   Quitar evento del bloque

router.post('/:id/events', validateRequest(addEventSchema), addEventToBlock);
router.delete('/:id/events/:eventId', removeEventFromBlock);

// ── WebBlockSlideImgs ─────────────────────────────────────────────────────────
// POST   /api/public/web-blocks/:id/slides             Agregar slide
// PUT    /api/public/web-blocks/:id/slides/:slideId    Actualizar slide
// DELETE /api/public/web-blocks/:id/slides/:slideId    Eliminar slide

router.post('/:id/slides', validateRequest(addSlideSchema), addSlideToBlock);
router.put('/:id/slides/:slideId', validateRequest(updateSlideSchema), updateSlide);
router.delete('/:id/slides/:slideId', removeSlide);

export default router;
