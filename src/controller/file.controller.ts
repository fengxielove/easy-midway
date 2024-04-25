import { Inject, Post, Fields, Files, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserDTO } from '../dto/user.js';
import { EasyController } from '@/decorator/EasyController.decorator.js';

@EasyController({
  prefix: 'commom',
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  controllerPath: import.meta.url,
})
export class FileController {
  @Inject()
  ctx: Context;

  @Post('/upload')
  async upload(@Files() files, @Fields() fields: object) {
    return {
      files,
      fields,
    };
  }

  @Post('/login')
  async login(@Body() body: UserDTO) {
    return {
      username: body.username,
      password: body.password,
    };
  }
}
