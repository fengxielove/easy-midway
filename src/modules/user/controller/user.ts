import { EasyController } from '@/decorator/EasyController.decorator.js';
import {
  Body,
  Get,
  Inject,
  Post,
  Query,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserEntity } from '../entity/user.entity.js';
import { UserDTO } from '@/dto/user.js';

@EasyController({
  prefix: '/user',
  api: ['add', 'info'],
  entity: UserEntity,
})
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Get('/info/:id')
  async getInfo(@Query() id: string) {
    return {
      id,
    };
  }
}
