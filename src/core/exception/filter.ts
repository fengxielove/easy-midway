import { Catch, Logger, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { GlobalConfig } from '../constant/glotbal.js';
import { ILogger } from '@midwayjs/logger';

@Catch()
export class EasyExceptionFilter {
  @Logger()
  private coreLogger: ILogger;

  async catch(err: MidwayHttpError, ctx: Context) {
    const { RESCODE } = GlobalConfig.getInstance();
    this.coreLogger.error(`Error in request ${ctx.request.url}`, err);

    return {
      code: err.status || RESCODE.COMMFAIL,
      message: err.message,
    };
  }
}
