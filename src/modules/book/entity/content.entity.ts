import { BaseEntity } from '@/core/index.js';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('book_contents')
export class ContentsEntity extends BaseEntity {
  @PrimaryColumn()
  fileName: string;

  @Column()
  href: string;

  @Column()
  order: number;

  @Column()
  level: number;

  @Column()
  text: string;

  @Column()
  label: string;

  @Column()
  pid: string;

  @PrimaryColumn()
  @Column()
  navId: string;
}
