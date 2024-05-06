import { Body, Get, Inject, Post, Provide } from '@midwayjs/core';
import {
  BaseController,
  EasyController,
  EasyEps,
  EasyTag,
  EasyUrlTag,
  TagTypes,
} from '@/core/index.js';
import { Validate } from '@midwayjs/validate';
import { LoginDTO } from '@/modules/base/dto/login.js';
import { BaseSysLoginService } from '@/modules/base/service/sys/login.js';

@Provide()
@EasyController({ description: '开放接口' })
@EasyUrlTag()
export class BaseOpenController extends BaseController {
  @Inject()
  bookUserService: BaseSysLoginService;

  @Inject()
  eps: EasyEps;

  @Get('/eps', { summary: '实体信息与路径' })
  public async getEps() {
    return this.ok(this.eps.admin);
  }

  @EasyTag(TagTypes.IGNORE_TOKEN)
  @Post('/login', { summary: '登录' })
  @Validate()
  async login(@Body() login: LoginDTO) {
    return this.ok(await this.bookUserService.login(login));
  }
}
