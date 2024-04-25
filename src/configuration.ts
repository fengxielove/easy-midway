import {
  Configuration,
  App,
  Logger,
  Inject,
  MidwayWebRouterService,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as orm from '@midwayjs/typeorm';
import { DefaultErrorFilter } from './filter/default.filter.js';
import DefaultConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';

// 后增
import * as upload from '@midwayjs/upload';
import * as staticFile from '@midwayjs/static-file';
import { RequestMiddleware } from './middleware/request.middleware.js';

import { ILogger } from '@midwayjs/logger';

@Configuration({
  imports: [
    koa,
    validate,
    upload,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    staticFile,
    orm,
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @Logger()
  logger: ILogger;

  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    const start = Date.now();
    this.app.useMiddleware([RequestMiddleware]);

    const eps = (await this.webRouterService.getFlattenRouterTable()).map(
      item => item.fullUrl
    );
    this.logger.info('eps', eps);

    this.app.useFilter([DefaultErrorFilter]);
    this.logger.info('启动耗时 %d ms', Date.now() - start);
  }
}
