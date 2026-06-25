import { Router } from 'express';
import { getCountries } from '../../controllers/countries.controller';

const router = Router();

/**
 * GET /api/public/countries
 * Lista de países para formularios públicos (registro, selección de idioma, etc.)
 * Acceso: sin autenticación
 */
router.get('/', getCountries);

export default router;
