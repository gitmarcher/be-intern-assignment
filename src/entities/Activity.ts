import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Index
  } from 'typeorm';

export enum ActivityType {
  POST_CREATED = 'POST_CREATED',
  POST_DELETED = 'POST_DELETED',
  POST_LIKED = 'POST_LIKED',
  USER_FOLLOWED = 'USER_FOLLOWED',
  USER_UNFOLLOWED = 'USER_UNFOLLOWED',
  FOLLOWED_BY = 'FOLLOWED_BY',
  UNFOLLOWED_BY = 'UNFOLLOWED_BY',
}

@Entity('activities')
@Index(['user','createdAt'])
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'activities', { onDelete: 'CASCADE' })
  user: any;

  @Column()
  type: ActivityType;
  
  @Column()
  reference_id: number; 

  @CreateDateColumn()
  createdAt: Date;
}
