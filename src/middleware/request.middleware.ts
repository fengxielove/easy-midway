import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class RequestMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();

      const result = await next(); // 确保打印日志在请求处理之后执行
      console.log(result);

      const endTime = Date.now();

      ctx.logger.info(
        `- 耗时: ${endTime - startTime}ms
        [请求信息：] ${ctx.method} ${ctx.url} - 参数: ${JSON.stringify(
          ctx.request.body
        )}
        [响应信息: ] ${JSON.stringify(result)}
         `
      );
    };
  }

  static getName(): string {
    return 'request';
  }
}
