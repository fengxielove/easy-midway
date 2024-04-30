import {
  ALL,
  Config,
  IMiddleware,
  Init,
  Inject,
  Middleware,
} from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { EasyUrlTagData, RESCODE, TagTypes } from '@/core/index.js';
import { startsWith } from 'lodash-es';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class UserMiddleware implements IMiddleware<Context, NextFunction> {
  @Config(ALL)
  easyConfig: any;

  @Inject()
  jwtService: JwtService;

  @Inject()
  easyUrlTagData: EasyUrlTagData;

  @Config('module.user.jwt')
  jwtConfig: { secret: string };

  @Config('koa.globalPrefix')
  prefix: string;

  ignoreUrls: string[] = [];

  @Init()
  async init() {
    this.ignoreUrls = this.easyUrlTagData.byKey(TagTypes.IGNORE_TOKEN, 'admin');
    console.log('this.ignoreUrls', this.ignoreUrls);
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      console.log('ctx.url', ctx.url);
      let url: string = ctx.url.replace(this.prefix, '').split('?')[0];
      if (startsWith(url, '/admin/')) {
        const token = ctx.get('Authorization');
        try {
          ctx.user = this.jwtService.verifySync(token, this.jwtConfig.secret);
          if (ctx.user.isRefresh) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效',
            };
            return;
          }
        } catch (error) {
          //   处理错误逻辑
        }
        // 使用matchUrl方法来检查URL是否应该被忽略
        const isIgnored = this.ignoreUrls.some(pattern =>
          this.matchUrl(pattern, url)
        );

        if (isIgnored) {
          await next();
          return;
        } else {
          if (!ctx.user) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效~',
            };
            return;
          }
        }
      }
      await next();
    };
  }

  // 匹配URL的方法
  matchUrl(pattern: string, url: string): boolean {
    const patternSegments = pattern.split('/').filter(Boolean);
    const urlSegments = url.split('/').filter(Boolean);

    // 如果段的数量不同，则无法匹配
    if (patternSegments.length !== urlSegments.length) {
      return false;
    }

    for (let i = 0; i < patternSegments.length; i++) {
      if (patternSegments[i].startsWith(':')) {
        // 如果模式段以 ':' 开始，我们认为它是一个参数，可以匹配任何内容
        continue;
      }
      // 如果两个段不相同，则不匹配
      if (patternSegments[i] !== urlSegments[i]) {
        return false;
      }
    }
    // 所有段都匹配
    return true;
  }
}
