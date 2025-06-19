import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export const userRouter = Router();
const userController = new UserController();

// Get all users
userRouter.get('/', userController.getAllUsers.bind(userController));

// Get user by id
userRouter.get('/:id', userController.getUserById.bind(userController));

userRouter.post('/follow/:id',authenticateToken, userController.followUser.bind(userController));

userRouter.post('/unfollow/:id',authenticateToken, userController.unfollowUser.bind(userController));

userRouter.get('/:id/followers', userController.getFollowers.bind(userController));

userRouter.get('/:id/following', userController.getFollowing.bind(userController));

userRouter.get('/:id/activity', userController.getUserActivity.bind(userController));
