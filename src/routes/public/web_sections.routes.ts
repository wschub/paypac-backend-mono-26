import { Router } from 'express';
import { getPublicNav, getPublicSectionByUrl } from '../../controllers/web_sections.controller';

const router = Router();

// GET /api/public/web-sections?lang=ES  → todos los grupos con secciones anidadas
router.get('/', getPublicNav);

// GET /api/public/web-sections/by-url/:url → sección individual por menu_url
router.get('/by-url/:url', getPublicSectionByUrl);

export default router;
