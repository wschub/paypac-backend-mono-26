import { Router } from 'express';
import { FollowersController } from '../controllers/followers.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { followUserSchema, getPaginatedSchema } from '../validators/followers.validation';

const router = Router();
const followersController = new FollowersController();

router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

router.post('/follow', validateRequest(followUserSchema), followersController.followUser.bind(followersController));
router.delete('/unfollow/:userId', followersController.unfollowUser.bind(followersController));
router.get('/my-followers', validateRequest(getPaginatedSchema), followersController.getMyFollowers.bind(followersController));
router.get('/my-following', validateRequest(getPaginatedSchema), followersController.getMyFollowing.bind(followersController));
router.patch('/block/:userId', followersController.blockUser.bind(followersController));
router.patch('/mute/:userId', followersController.muteUser.bind(followersController));
router.patch('/unmute/:userId', followersController.unmuteUser.bind(followersController));

export default router;
