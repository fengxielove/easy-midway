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

import * as easy from '@/core/index.js';
import * as jwt from '@midwayjs/jwt';

@Configuration({
  imports: [
    koa,
    validate,
    jwt,
    upload,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    staticFile,
    orm,
    easy,
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
    this.logger.info('服务启动中');
    const start = Date.now();
    this.app.useMiddleware([RequestMiddleware]);

    this.app.useFilter([DefaultErrorFilter]);

    let eps = [];
    let allRoutes = await this.webRouterService.getFlattenRouterTable();
    allRoutes.map(item => {
      eps.push(item.fullUrl);
    });
    this.logger.info('eps', eps);
    this.logger.info('启动耗时 %d ms', Date.now() - start);
  }
}
