import { Router } from 'express';
import { PointsController } from '../controllers/points.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { transferPointsSchema, getHistorySchema } from '../validators/points.validation';

const router = Router();
const pointsController = new PointsController();

router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

router.get('/balance', pointsController.getBalance.bind(pointsController));
router.get('/history', validateRequest(getHistorySchema), pointsController.getHistory.bind(pointsController));
router.post('/transfer', validateRequest(transferPointsSchema), pointsController.transferPoints.bind(pointsController));
router.get('/expiring', pointsController.getExpiringPoints.bind(pointsController));

export default router;
