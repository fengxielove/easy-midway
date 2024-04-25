import { Context } from '@midwayjs/koa';
import { MidwayValidationError } from '@midwayjs/validate';

export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    ctx.logger.error(err);
    return {
      status: 400,
      message: '参数校验失败' + err.message,
    };
  }
}
