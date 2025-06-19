import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';
import { Post } from './Post';

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true }) 
  @Column('varchar', { length: 255 })
  tag: string;

  @ManyToMany(() => Post, post => post.hashtags)
  posts: Post[];
}