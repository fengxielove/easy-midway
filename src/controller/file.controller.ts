import { Inject, Post, Fields, Files, Body, Controller } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserDTO } from '../dto/user.js';
import { ValidateService } from '@midwayjs/validate';

@Controller('/file')
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
