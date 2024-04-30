import { BaseEntity } from '@/core/index.js';
import { Entity, Column, Unique } from 'typeorm';

@Entity('book_auth')
export class RoleEntity extends BaseEntity {
  @Column()
  @Unique(['key'])
  key: string;

  @Column()
  name: string;

  @Column()
  remark: string;
}
