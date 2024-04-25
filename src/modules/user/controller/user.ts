import { EasyController } from '@/decorator/EasyController.decorator.js';
import { Get, Inject, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserEntity } from '../entity/user.entity.js';

@EasyController({
  prefix: '/user',
  api: ['add', 'info'],
  entity: UserEntity,
})
export class UserController {
  @Inject()
  ctx: Context;

  @Get('/info/:id')
  async getInfo(@Query() id: string) {
    return {
      id,
    };
  }
}
