import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('base_user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    nullable: false,
    comment: '用户名',
  })
  username: string;

  //   @Column({
  //     length: 20,
  //     nullable: false,
  //     comment: '真实姓名',
  //   })
  //   name: string;

  //   @Column()
  //   password: string;

  //   @Column({ comment: '密码等级' })
  //   passwordV: string;

  //   @Column({ comment: '昵称' })
  //   nickname: string;

  //   @Column({ comment: '头像' })
  //   headImg: string;

  //   @Column({ comment: '手机号' })
  //   phone: string;

  //   @Column({ comment: '邮箱' })
  //   email: string;

  //   @Column({ comment: '备注' })
  //   reamrk: string;

  //   @Column({ comment: '状态: 1启用，0禁用' })
  //   status: number;

  //   @Column({ comment: 'socket' })
  //   socketId: string;

  @Column({ comment: '创建时间' })
  createTime: Date;

  @Column({ comment: '更新时间' })
  updateTime: Date;
}
