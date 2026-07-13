import { Router } from 'express';
import {
  getBlocks,
  getSlides,
  addSlide,
  updateSlide,
  removeSlide,
} from '../controllers/web_blocks.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

const paypacOnly = [authenticate, authorizeRoles('PAYPAC')];

// ── Bloques (lectura, para selects) ─────────────────────────────────────────────
// GET /api/web-blocks            → lista de bloques (datos básicos)
router.get('/', ...paypacOnly, getBlocks);

// ── Slides ───────────────────────────────────────────────────────────────────────
// Nota: /slides se declara antes que cualquier ruta con :id para que Express
// no la capture como un id.
// GET    /api/web-blocks/slides                      → todos los slides (plano)
// POST   /api/web-blocks/:id/slides                  → agregar slide a un bloque
// PUT    /api/web-blocks/:id/slides/:slideId         → actualizar slide
// DELETE /api/web-blocks/:id/slides/:slideId         → eliminar slide
router.get('/slides', ...paypacOnly, getSlides);
router.post('/:id/slides', ...paypacOnly, addSlide);
router.put('/:id/slides/:slideId', ...paypacOnly, updateSlide);
router.delete('/:id/slides/:slideId', ...paypacOnly, removeSlide);

export default router;
