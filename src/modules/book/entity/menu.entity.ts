import { BaseEntity } from '@/core/index.js';
import { Entity, Column, Unique } from 'typeorm';

@Entity('book_menu')
export class MenuEntity extends BaseEntity {
  @Column()
  path: string;

  @Column()
  @Unique(['name'])
  name: string;

  @Column()
  redirect: string;

  @Column()
  meta: string;

  @Column()
  pid: number;

  // 1-可用, 0-不可用
  @Column({ default: 1 })
  active: number;
}
