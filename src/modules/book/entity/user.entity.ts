import { BaseEntity } from '@/core/index.js';
import { Column, Entity, Unique } from 'typeorm';

@Entity('book_user')
export class UserEntity extends BaseEntity {
  @Column()
  @Unique(['username'])
  username: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column()
  role: string;

  @Column()
  nickname: string;

  @Column()
  active: number;
}
