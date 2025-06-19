import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { Activity,ActivityType } from '../entities/Activity';
import { IsNull, In, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { formatActivities } from '../utils/formatActivities';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private activityRepository = AppDataSource.getRepository(Activity);
  private followRepository = AppDataSource.getRepository(Follow);
  private postRepository = AppDataSource.getRepository(Post);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }


  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({ id: user.id, email: user.email });
      res.json({ jwt_token: token, user });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }

  async followUser(req: Request, res: Response) {
    const followingId = parseInt(req.params.id, 10);
    const followerId = req.user!.id;

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      if (followerId === followingId) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }

      const existingFollow = await this.followRepository.findOne({
        where: {
          follower: { id: followerId },
          following: { id: followingId },
          unfollowedAt: IsNull(),
        },
      });

      if (existingFollow) {
        return res.status(400).json({ message: 'Already following this user' });
      }

      const follower = await this.userRepository.findOneBy({ id: followerId });
      const following = await this.userRepository.findOneBy({ id: followingId });

      if (!follower || !following) {
        return res.status(404).json({ message: 'User not found' });
      }

      const follow = new Follow();
      follow.follower = follower;
      follow.following = following;
      await this.followRepository.save(follow);

      const activity = new Activity();
      activity.user = follower;
      activity.type = ActivityType.USER_FOLLOWED;
      activity.reference_id = following.id;

      const activityForFollowed = new Activity();
      activityForFollowed.user = following;
      activityForFollowed.type = ActivityType.FOLLOWED_BY;
      activityForFollowed.reference_id = follower.id;

      await this.activityRepository.save(activity);
      await this.activityRepository.save(activityForFollowed);


      return res.status(200).json({ message: 'User followed successfully' });
    } catch (error) {
      console.error('Error following user:', error);
      return res.status(500).json({ message: 'Error following user', error });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    const followingId = parseInt(req.params.id, 10);
    const followerId = req.user!.id;

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const follow = await this.followRepository.findOne({
        where: {
          follower: { id: followerId },
          following: { id: followingId },
          unfollowedAt: IsNull(),
        },
        relations: ['follower', 'following'],
      });

      if (!follow) {
        return res.status(400).json({ message: 'Not following this user' });
      }

      follow.unfollowedAt = new Date();
      await this.followRepository.save(follow);

      const activity = new Activity();
      activity.user = follow.follower;
      activity.type = ActivityType.USER_UNFOLLOWED;
      activity.reference_id = follow.following.id;
      await this.activityRepository.save(activity);

      const activityForUnfollowed = new Activity();
      activityForUnfollowed.user = follow.following;
      activityForUnfollowed.type = ActivityType.UNFOLLOWED_BY;
      activityForUnfollowed.reference_id = follow.follower.id;
      await this.activityRepository.save(activityForUnfollowed);

      return res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return res.status(500).json({ message: 'Error unfollowing user', error });
    }
  }

  async getFollowers(req: Request, res: Response) {
    const userId = parseInt(req.params.id, 10);
    
    try {
      const followers = await this.followRepository.find({
        where: { following: { id: userId }, unfollowedAt: IsNull() },
        relations: ['follower'],
      });

      const formattedFollowers = followers.map(f => f.follower);
      res.json(formattedFollowers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching followers', error });
    }
  }

  async getFollowing(req: Request, res: Response) {
    const userId = parseInt(req.params.id, 10);

    try {
      console.log(`Fetching following for user ${userId}`);
      const following = await this.followRepository.find({
        where: { follower: { id: userId }, unfollowedAt: IsNull() },
        relations: ['following'],
      });
      console.log(`Found ${following.length} following relationships for user ${userId}`);

      const formattedFollowing = following.map(f => f.following);
      res.json(formattedFollowing);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching following', error });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    const userId = parseInt(req.params.id, 10);
    const {type, startDate, endDate, sort} = req.query;

    const sortOrder = sort === 'asc' ? 'ASC' : 'DESC';
    const rawLimit = req.query.limit;
    const limit = rawLimit ? parseInt(rawLimit as string, 10) : 10;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    try{
      const query:any = {
        user : {id:userId}
      }

      const types: { [key: string]: ActivityType[] } = {
        post: [ActivityType.POST_CREATED, ActivityType.POST_DELETED],
        like: [ActivityType.POST_LIKED],
        follow: [
          ActivityType.USER_FOLLOWED,
          ActivityType.USER_UNFOLLOWED,
          ActivityType.FOLLOWED_BY,
          ActivityType.UNFOLLOWED_BY,
        ],
        all: [
          ActivityType.POST_CREATED,
          ActivityType.POST_DELETED,
          ActivityType.POST_LIKED,
          ActivityType.USER_FOLLOWED,
          ActivityType.USER_UNFOLLOWED,
          ActivityType.FOLLOWED_BY,
          ActivityType.UNFOLLOWED_BY,
        ]
      };
      
      const selectedTypes = types[(type as string)?.toLowerCase() || 'all'];
      query.type = In(selectedTypes);

      if (startDate && endDate) {
        query.createdAt = Between(new Date(startDate as string), new Date(endDate as string));
      } else if (startDate) {
        query.createdAt = MoreThanOrEqual(new Date(startDate as string));
      } else if (endDate) {
        query.createdAt = LessThanOrEqual(new Date(endDate as string));
      }
      console.log('Activity query:', JSON.stringify(query, null, 2));
      const activities = await this.activityRepository.find({
        where: query,
        order: { createdAt: sortOrder },
        relations: ['user'],
        skip : offset,
        take : limit
      });
      console.log(`Found ${activities.length} activities for user ${userId}`);

      const userIds = activities
        .map(a => a.reference_id)
        .filter(id => id !== null);
      
      const users = await this.userRepository.find({
        where: { id: In(userIds) }
      });

      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {} as Record<number, User>);

      const formattedActivities = await formatActivities(activities, userMap);
      
      res.send({
        activities: formattedActivities,
        pagination: {
          total: await this.activityRepository.count({ where: query }),
          count: activities.length,
          limit,
          offset,
          hasMore: (offset + limit) < (await this.activityRepository.count({ where: query })),
        },
      });

    }catch (error) {
      console.error('Error fetching user activity:', error);
      return res.status(500).json({ message: 'Error fetching user activity', error });
    }
  }
  
}
