import { Inject, Post, Fields, Files, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserDTO } from '../dto/user.js';
import { EasyController } from '@/decorator/controller.js';
import { ValidateService } from '@midwayjs/validate';

@EasyController({
  prefix: 'commom',
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  dto: UserDTO,
  controllerPath: import.meta.url,
})
export class FileController {
  @Inject()
  ctx: Context;

  @Inject()
  validateService: ValidateService;

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
