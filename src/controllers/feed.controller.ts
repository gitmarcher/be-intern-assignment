
import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { Activity } from '../entities/Activity';
import { IsNull,In } from 'typeorm';
import { formatPosts } from '../utils/formatPost';




export class FeedController {
    private userRepository = AppDataSource.getRepository(User);
    private activityRepository = AppDataSource.getRepository(Activity);
    private followRepository = AppDataSource.getRepository(Follow);
    private postRepository = AppDataSource.getRepository(Post);

    async getUserFeed(req: Request, res: Response) {
        const userId = parseInt(req.params.id, 10);
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
      
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
      
        try {
          const followings = await this.followRepository.find({
            where: {
              follower: { id: userId },
              unfollowedAt: IsNull(),
            },
            relations: ['following'],
          });
      
          const followingUserIds = followings.map(f => f.following.id);
          if (followingUserIds.length === 0) {
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
      
          const [posts, totalCount] = await this.postRepository.findAndCount({
            where: {
              user_id: { id: In(followingUserIds) },
            },
            relations: ['user_id', 'likes', 'hashtags'],
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit,
          });
      
          const formattedPosts = formatPosts(posts);
      
          return res.status(200).json({
            posts: formattedPosts,
            pagination: {
              total: totalCount,
              count: formattedPosts.length,
              limit,
              offset,
              hasMore: offset + formattedPosts.length < totalCount,
            },
          });
        } catch (error) {
          console.error('Error fetching user feed:', error);
          return res.status(500).json({ message: 'Error fetching user feed', error });
        }
      }
    };