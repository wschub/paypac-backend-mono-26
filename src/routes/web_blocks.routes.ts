import { Router } from 'express';
import {
  getBlocks,
  getBlocksFull,
  createBlock,
  updateBlock,
  getSlides,
  addSlide,
  updateSlide,
  removeSlide,
  addEvent,
  removeEvent,
} from '../controllers/web_blocks.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

const paypacOnly = [authenticate, authorizeRoles('PAYPAC')];

// ── Bloques ─────────────────────────────────────────────────────────────────────
// Nota: las rutas estáticas (/full, /slides) se declaran antes que las de :id.
// GET /api/web-blocks            → bloques (datos básicos, para selects)
// GET /api/web-blocks/full       → bloques completos (eventos + slides), id asc
// PUT /api/web-blocks/:id        → actualizar campos del bloque
router.get('/', ...paypacOnly, getBlocks);
router.get('/full', ...paypacOnly, getBlocksFull);
router.post('/', ...paypacOnly, createBlock);

// ── Slides ───────────────────────────────────────────────────────────────────────
// GET    /api/web-blocks/slides                      → todos los slides (plano)
// POST   /api/web-blocks/:id/slides                  → agregar slide a un bloque
// PUT    /api/web-blocks/:id/slides/:slideId         → actualizar slide
// DELETE /api/web-blocks/:id/slides/:slideId         → eliminar slide
router.get('/slides', ...paypacOnly, getSlides);
router.post('/:id/slides', ...paypacOnly, addSlide);
router.put('/:id/slides/:slideId', ...paypacOnly, updateSlide);
router.delete('/:id/slides/:slideId', ...paypacOnly, removeSlide);

// ── Eventos del bloque ────────────────────────────────────────────────────────
// POST   /api/web-blocks/:id/events            → agregar evento al bloque
// DELETE /api/web-blocks/:id/events/:eventId   → quitar evento del bloque
router.post('/:id/events', ...paypacOnly, addEvent);
router.delete('/:id/events/:eventId', ...paypacOnly, removeEvent);

// PUT al final para que no capture rutas estáticas
router.put('/:id', ...paypacOnly, updateBlock);

export default router;
