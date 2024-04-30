import {
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EasyBaseEntity } from './typeorm.js';

export class BaseEntity extends EasyBaseEntity {
  @PrimaryGeneratedColumn('increment', { comment: 'ID' })
  id: number;

  @Index()
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}
