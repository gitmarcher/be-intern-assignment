import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export const feedRouter = Router();
const feedController = new FeedController();

feedRouter.get('/:id', authenticateToken, feedController.getUserFeed.bind(feedController));
