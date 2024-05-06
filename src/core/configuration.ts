import {
  App,
  Configuration,
  ILifeCycle,
  IMidwayApplication,
  IMidwayBaseApplication,
  IMidwayContainer,
  Inject,
  Logger,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { EasyEventManager } from './event/index.js';
import { EasyModuleConfig, EasyModuleImport } from '@/core/index.js';
import { EasyExceptionFilter } from '@/core/index.js';
import { EasyDecorator } from '@/core/index.js';
import { FuncUtil } from '@/core/index.js';
import LocationUtil from '@/core/util/location.js';
import * as cache from '@midwayjs/cache-manager';

// 注入 cache-manager
@Configuration({
  namespace: 'easy',
  imports: [cache],
})
export class EasyConfiguration implements ILifeCycle {
  @Logger()
  coreLogger: any;

  @App()
  app: IMidwayApplication;

  @Inject()
  easyEventManager: EasyEventManager;

  async onReady(container: IMidwayContainer) {
    this.coreLogger.info('core onReady in configuration.ts');
    this.easyEventManager.emit('onReady');

    // moduleInfo EasyModuleConfig {
    //   app: [Getter],
    //   allConfig: [Getter],
    //   modules: [ 'user', 'book' ]
    // }
    // 异步从依赖注入容器中获取一个名为 EasyModuleConfig 的配置模块

    // 处理模块配置
    await container.getAsync(EasyModuleConfig);

    // 常用函数处理
    await container.getAsync(FuncUtil);

    // 添加异常处理信息
    this.app.useFilter([EasyExceptionFilter]);
    // 获取 装饰器模块，装饰器模块中会自执行 init 注册装饰器
    await container.getAsync(EasyDecorator);

    //   清除 location
    setTimeout(() => {
      LocationUtil.clean();
      this.coreLogger.info('\x1B[36m [easy:core] location clean \x1B[0m');
    }, 10000);
  }

  async onConfigLoad(
    container: IMidwayContainer,
    mainApp?: IMidwayBaseApplication<Context>
  ) {
    this.coreLogger.info('onConfigLoad');
  }

  async onServerReady(container: IMidwayContainer) {
    // 事件模块的初始化
    await (await container.getAsync(EasyEventManager)).init();

    // 导入默认模块数据
    await (await container.getAsync(EasyModuleImport)).init();

    // const eps = await container.getAsync()
  }
}
