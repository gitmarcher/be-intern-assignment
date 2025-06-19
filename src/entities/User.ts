import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import bcrypt from 'bcryptjs';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({type: 'text'})
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Post', 'user_id')
  posts: any[];

  @OneToMany('Like', 'user')
  likes: any[];

  @OneToMany('Follow', 'follower')
  following: any[];

  @OneToMany('Follow', 'following')
  followers: any[];

  @OneToMany('Activity', 'user')
  activities: any[];
}
