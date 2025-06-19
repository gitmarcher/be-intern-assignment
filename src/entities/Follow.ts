// src/entities/Follow.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, Index } from 'typeorm';

@Entity('follows')
@Index(['follower', 'following'], { unique: true }) 
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', 'following', { onDelete: 'CASCADE' })
  follower: any;

  @ManyToOne('User', 'followers', { onDelete: 'CASCADE' })
  following: any;

  @CreateDateColumn()
  followedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  unfollowedAt: Date | null;
}
