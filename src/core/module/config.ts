import {
  ALL,
  App,
  Config,
  IMidwayApplication,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { existsSync, readdirSync, statSync } from 'fs';
import { isEmpty, orderBy } from 'lodash-es';
import { EasyCoreException } from '@/core/index.js';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyModuleConfig {
  @App()
  private app: IMidwayApplication;

  // @Config(ALL): 这个装饰器用于自动注入配置信息到类的属性中。ALL 是一个特殊的标识符，通常在 MidwayJS 框架中用于指示装饰器注入所有可用的配置数据
  @Config(ALL)
  private allConfig: { [key: string]: any };

  modules: string[];

  @Init()
  async init() {
    let modules = [];
    const moduleBasePath = `${this.app.getBaseDir()}/modules/`;
    if (!existsSync(moduleBasePath)) {
      return;
    }

    if (!this.allConfig['module']) {
      this.allConfig['module'] = {};
    }

    const globalMiddlewareArr = [];

    for (const module of readdirSync(moduleBasePath)) {
      const modulePath = `${moduleBasePath}/${module}`;
      const dirStats = statSync(modulePath);

      if (dirStats.isDirectory()) {
        const configPath = existsSync(`${modulePath}/config.ts`)
          ? `${modulePath}/config.ts`
          : `${modulePath}/config.js`;

        if (existsSync(configPath)) {
          const moduleConfig = (await import(configPath)).default({
            app: this.app,
            env: this.app.getEnv(),
          });
          modules.push({
            order: moduleConfig.order || 0,
            module,
          });

          await this.moduleConfig(module, moduleConfig);

          if (!isEmpty(moduleConfig.globalMiddlewares)) {
            globalMiddlewareArr.push({
              order: moduleConfig.order || 0,
              data: moduleConfig.globalMiddlewares,
            });
          }
        } else {
          throw new EasyCoreException(
            `Module 【${module}  lacks a config.ts configuration file 】`
          );
        }
      }

      this.modules = orderBy(modules, ['order'], ['desc']).map(e => e.module);
      await this.globalMiddlewareArr(globalMiddlewareArr);
    }
  }

  /**
   * 模块配置
   * @param module 模块
   * @param config 配置
   */
  private async moduleConfig(module: string, config: any): Promise<void> {
    this.allConfig['module'][module] = config;
  }

  /**
   * 全局中间件
   * @param middlewares 中间件
   */
  private async globalMiddlewareArr(middlewares: any[]) {
    middlewares = orderBy(middlewares, ['order'], ['desc']);
    for (const middleware of middlewares) {
      for (const item of middleware.data) {
        this.app.getMiddleware().insertLast(item);
      }
    }
  }
}
