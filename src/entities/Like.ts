// src/entities/Like.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';

@Entity('likes')
@Index(['user', 'post'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'likes', { onDelete: 'CASCADE' })
  user: any;

  @ManyToOne('Post', 'likes', { onDelete: 'CASCADE' })
  post: any;

  @CreateDateColumn()
  likedAt: Date;
}
