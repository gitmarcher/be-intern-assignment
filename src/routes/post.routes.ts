import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { PostController } from '../controllers/post.controller';
import { createPostSchema } from '../validations/post.validation';
import { authenticateToken } from '../middleware/auth.middleware';


export const postRouter = Router();
const postController = new PostController();

postRouter.get('/', postController.getAllPosts.bind(postController));

postRouter.post('/', authenticateToken, validate(createPostSchema), postController.createPost.bind(postController));

postRouter.put('/:id', authenticateToken, postController.updatePost.bind(postController));

postRouter.delete('/:id', authenticateToken, postController.deletePost.bind(postController));

postRouter.get('/search/:id',postController.getPostById.bind(postController));

postRouter.get('/hashtag/:tag', postController.getPostsByHashtag.bind(postController));

postRouter.post('/like/:id', authenticateToken, postController.likePost.bind(postController));

postRouter.post('/unlike/:id', authenticateToken, postController.unlikePost.bind(postController));
