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
import { EasyEventManager } from './event/index.js';
import { Context } from '@midwayjs/koa';
import { EasyModuleConfig } from '@/core/module/config.js';
import { EasyExceptionFilter } from '@/core/exception/filter.js';
import { EasyDecorator } from '@/core/decorator/index.js';

@Configuration({
  namespace: 'easy',
  imports: [],
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
    // 处理模块配置
    // moduleInfo EasyModuleConfig {
    //   app: [Getter],
    //   allConfig: [Getter],
    //   modules: [ 'user', 'book' ]
    // }
    // 异步从依赖注入容器中获取一个名为 EasyModuleConfig 的配置模块
    await container.getAsync(EasyModuleConfig);

    //   TODO 常用函数处理

    // 添加异常处理信息
    this.app.useFilter([EasyExceptionFilter]);
    // 获取 装饰器模块，装饰器模块中会自执行 init 注册装饰器
    await container.getAsync(EasyDecorator);
  }

  async onConfigLoad(
    container: IMidwayContainer,
    mainApp?: IMidwayBaseApplication<Context>
  ) {}
}
