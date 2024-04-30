import { BaseEntity } from '@/core/index.js';
import { Entity, Column, Unique } from 'typeorm';

@Entity('book')
export class Book extends BaseEntity {
  @Column()
  @Unique(['fileName'])
  fileName: string;

  @Column()
  cover: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  publisher: string;

  @Column()
  bookId: string;

  @Column()
  category: number;

  @Column()
  categoryText: string;

  @Column()
  language: string;

  @Column()
  rootFile: string;
}
