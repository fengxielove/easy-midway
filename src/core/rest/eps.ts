import {
  Inject,
  Provide,
  Scope,
  MidwayWebRouterService,
  ScopeEnum,
  Config,
  Init,
  listModule,
  CONTROLLER_KEY,
  getClassMetadata,
} from '@midwayjs/core';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { EasyUrlTagData, TagTypes } from '@/core/index.js';
import { groupBy, isEmpty, startsWith } from 'lodash-es';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyEps {
  @Inject()
  midwayWebRouterService: MidwayWebRouterService;

  @Inject()
  typeORMDataSourceManager: TypeORMDataSourceManager;

  @Config('easy.eps')
  epsConfig: boolean;

  @Config('module')
  moduleConfig: any;

  @Inject()
  easyUrlTagData: EasyUrlTagData;

  admin: object;
  app: object;
  module: object;

  constructor() {
    this.admin = {};
    this.app = {};
    this.module = {};
  }

  @Init()
  async init() {
    if (!this.epsConfig) {
      return;
    }

    const entities = await this.entity();
    const controllers = await this.controller();
    const routers = await this.router();

    await this.modules();

    const adminArr = [];
    const appArr = [];

    for (const controller of controllers) {
      const { prefix, module, curdOption, routerOptions } = controller;
      const name = curdOption?.entity?.name;
      const isAdmin = startsWith(prefix, '/admin/');

      const routeType = {
        name: prefix.split('/').pop(),
        description: routerOptions?.description || '',
      };

      const controllerInfo = {
        module,
        info: { type: routeType },
        api: routers[prefix],
        name,
        columns: entities[name] || [],
        prefix,
      };

      if (isAdmin) {
        adminArr.push(controllerInfo);
      } else {
        appArr.push(controllerInfo);
      }
    }

    this.admin = groupBy(adminArr, 'module');
    this.app = groupBy(appArr, 'module');

    console.log('admin', this.admin);
  }

  // 模块信息
  async modules(module?: '') {
    for (const key in this.moduleConfig) {
      const config = this.moduleConfig[key];
      this.module[key] = {
        name: config.name,
        description: config.description,
      };
    }
    return module ? this.module[module] : this.module;
  }

  /**
   * 所有 controller
   */
  async controller() {
    const result = [];
    const controllers = listModule(CONTROLLER_KEY);
    for (const controller of controllers) {
      result.push(getClassMetadata(CONTROLLER_KEY, controller));
    }
    return result;
  }

  /**
   * 所有路由
   */
  private async router() {
    let ignoreUrls = this.easyUrlTagData.byKey(TagTypes.IGNORE_TOKEN);
    if (!isEmpty(ignoreUrls)) {
      ignoreUrls = [];
    }

    return groupBy(
      (await this.midwayWebRouterService.getFlattenRouterTable()).map(item => {
        return {
          method: item.requestMethod,
          path: item.url,
          summary: item.summary,
          dts: {},
          tag: '',
          prefix: item.prefix,
          ignoreToken: ignoreUrls.includes(item.prefix + item.url),
        };
      }),
      'prefix'
    );
  }

  async entity() {}
}
