import { Catch, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.logger.error(
      `
      [请求信息：] ${ctx.method} ${ctx.url} - 参数：${JSON.stringify(
        ctx.request.body
      )}
      [响应信息：] ${err.message}
      powered by default.filter
      `
    );
    // 所有的未分类错误会到这里
    let message = err.message;
    if (Number(err.status) === 422) {
      message = `参数校验错误：${message}`;
    }
    return {
      code: Number(err.code),
      success: false,
      message: message,
    };
  }
}
