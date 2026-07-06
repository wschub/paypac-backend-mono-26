import { Router } from 'express';
import {
  getTypes, createType, updateType, deleteType,
  getGroups, getGroupById, createGroup, updateGroup, deleteGroup,
  getSections, getSectionById, createSection, updateSection, deleteSection,
} from '../controllers/web_sections.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

const paypacOnly = [authenticate, authorizeRoles('PAYPAC')];
const anyAuth    = [authenticate];

// ── Types ──────────────────────────────────────────────────────────────────────
router.get   ('/types',     ...anyAuth,    getTypes);
router.post  ('/types',     ...paypacOnly, createType);
router.put   ('/types/:id', ...paypacOnly, updateType);
router.delete('/types/:id', ...paypacOnly, deleteType);

// ── Groups ─────────────────────────────────────────────────────────────────────
router.get   ('/groups',     ...anyAuth,    getGroups);
router.get   ('/groups/:id', ...anyAuth,    getGroupById);
router.post  ('/groups',     ...paypacOnly, createGroup);
router.put   ('/groups/:id', ...paypacOnly, updateGroup);
router.delete('/groups/:id', ...paypacOnly, deleteGroup);

// ── Sections ───────────────────────────────────────────────────────────────────
router.get   ('/',     ...anyAuth,    getSections);
router.get   ('/:id',  ...anyAuth,    getSectionById);
router.post  ('/',     ...paypacOnly, createSection);
router.put   ('/:id',  ...paypacOnly, updateSection);
router.delete('/:id',  ...paypacOnly, deleteSection);

export default router;
