import { Router } from 'express';
import { InterestsController } from '../controllers/interests.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createInterestSchema, updateInterestSchema } from '../validators/interests.validation';

const router = Router();
const interestsController = new InterestsController();

router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

router.get('/my-interests', interestsController.getMyInterests.bind(interestsController));
router.post('/', validateRequest(createInterestSchema), interestsController.createInterest.bind(interestsController));
router.patch('/:id', validateRequest(updateInterestSchema), interestsController.updateInterest.bind(interestsController));
router.delete('/:id', interestsController.deleteInterest.bind(interestsController));

export default router;
