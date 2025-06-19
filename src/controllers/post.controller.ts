import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Hashtag } from '../entities/Hashtag';
import { Activity } from '../entities/Activity';
import { ActivityType } from '../entities/Activity';
import { AppDataSource } from '../data-source';
import { formatPosts } from '../utils/formatPost';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);
  private hashtagRepository = AppDataSource.getRepository(Hashtag);
  private activityRepository = AppDataSource.getRepository(Activity);



  async createPost(req: Request, res: Response) {
    try {
      const { content, hashtags } = req.body;
      const { id, email } = req.user!;


      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    
      const post = new Post();
      post.user_id = user;
      post.content = content;
      post.likes = []; 

      
      post.hashtags = [];
      if (Array.isArray(hashtags)) {
        for (const tagText of hashtags) {
          let hashtag = await this.hashtagRepository.findOneBy({ tag: tagText });
          if (!hashtag) {
            hashtag = new Hashtag();
            hashtag.tag = tagText;
            await this.hashtagRepository.save(hashtag);
          }
          post.hashtags.push(hashtag);
        }
      }

     
      const savedPost = await this.postRepository.save(post);
      const finalPost = Array.isArray(savedPost) ? savedPost[0] : savedPost;

      
      const activity = new Activity();
      activity.user = user;
      activity.type = ActivityType.POST_CREATED;
      activity.reference_id = finalPost.id;
      await this.activityRepository.save(activity);

      const formattedPost = formatPosts([finalPost]);

      return res.status(201).json(formattedPost[0]);
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ message: 'Error creating post', error });
    }
  }

  async getAllPosts(req:Request, res:Response){
    const rawLimit = parseInt(req.query.limit as string);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 10);

    const offset = parseInt(req.query.offset as string) || 0;

    try{
        const posts = await this.postRepository.find({
            relations: ['user_id', 'likes', 'hashtags'],
            skip: offset,
            take: limit,
        });

        if (posts.length === 0) {
          return res.status(200).json({
              posts: [],
              pagination: {
                  total: 0,
                  count: 0,
                  limit,
                  offset,
                  hasMore: false,
              },
          });
      }

        const formattedPosts = formatPosts(posts);
        
        
        return res.status(200).json({
            posts: formattedPosts,
            pagination: {
                total: await this.postRepository.count(),
                count: formattedPosts.length,
                limit,
                offset,
                hasMore: (offset + limit) < (await this.postRepository.count()),
            }
        });
    }catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostById(req: Request, res: Response) {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    
    const postId = parseInt(req.params.id, 10);

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user_id', 'likes', 'hashtags'],
        order: { createdAt: 'DESC' }
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const formattedPost = formatPosts([post]);

      return res.status(200).json(formattedPost[0]);
    } catch (error) {
      console.error('Error fetching post:', error);
      return res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async getPostsByHashtag(req: Request, res: Response) {
    const { tag } = req.params;

    if (!tag) {
      return res.status(400).json({ message: 'Hashtag is required' });
    }

    try {
      const hashtag = await this.hashtagRepository.findOne({
        where: { tag },
        relations: ['posts', 'posts.user_id', 'posts.likes', 'posts.hashtags'],
        order: { posts: { createdAt: 'DESC' } },
      });

      if (!hashtag) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      const formattedPosts = formatPosts(hashtag.posts);
      return res.status(200).json(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts by hashtag:', error);
      return res.status(500).json({ message: 'Error fetching posts by hashtag', error });
    }
  }

  async updatePost(req: Request, res: Response) {
    const postId = parseInt(req.params.id, 10);
    const { content, hashtags } = req.body;

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user_id', 'likes', 'hashtags']
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.content = content || post.content;

      if (hashtags && Array.isArray(hashtags)) {
        post.hashtags = [];
        for (const tagText of hashtags) {
          let hashtag = await this.hashtagRepository.findOneBy({ tag: tagText });
          if (!hashtag) {
            hashtag = new Hashtag();
            hashtag.tag = tagText;
            await this.hashtagRepository.save(hashtag);
          }
          post.hashtags.push(hashtag);
        }
      }

      const updatedPost = await this.postRepository.save(post);
      const finalUpdatedPost = Array.isArray(updatedPost) ? updatedPost[0] : updatedPost;
      const formattedPost = formatPosts([finalUpdatedPost]);
      return res.status(200).json(formattedPost[0]);
    } catch (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    const postId = parseInt(req.params.id, 10);

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user_id', 'likes', 'hashtags']
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      await this.postRepository.remove(post);

      const activity = new Activity();
      activity.user = post.user_id;
      activity.type = ActivityType.POST_DELETED;
      activity.reference_id = post.id;
      await this.activityRepository.save(activity);

      return res.status(204).json({message:'Post deleted successfully'});
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ message: 'Error deleting post', error });
    }
  }

  async likePost(req: Request, res: Response) {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user_id', 'likes', 'hashtags']
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (post.likes.some(like => like.id === user.id)) {
        return res.status(400).json({ message: 'User has already liked this post' });
      }

      post.likes.push(user);
      await this.postRepository.save(post);
      const formattedPosts = formatPosts([post]);


      return res.status(200).json(formattedPosts[0]);
    } catch (error) {
      console.error('Error liking post:', error);
      return res.status(500).json({ message: 'Error liking post', error });
    }
  }

  async unlikePost(req: Request, res: Response) {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user_id', 'likes', 'hashtags']
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      post.likes = post.likes.filter(like => like.id !== user.id);
      await this.postRepository.save(post);

      const formattedPosts = formatPosts([post]);

      return res.status(200).json(formattedPosts[0]);
    } catch (error) {
      console.error('Error unliking post:', error);
      return res.status(500).json({ message: 'Error unliking post', error });
    }
  }

}
