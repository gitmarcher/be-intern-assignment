import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    UpdateDateColumn,
    ManyToMany,
    ManyToOne,
    JoinTable
  } from 'typeorm';
import {Hashtag} from './Hashtag';


@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text', length: 3000 })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne('User', 'posts',{onDelete: 'CASCADE'})
    user_id: any;

    @OneToMany('Like', 'post')
    likes: any[];

    @ManyToMany(() => Hashtag, hashtag => hashtag.posts)
    @JoinTable()
    hashtags: Hashtag[];
}