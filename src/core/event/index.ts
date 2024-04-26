import {
  Config,
  IMidwayApplication,
  Provide,
  Scope,
  ScopeEnum,
  getClassMetadata,
  listModule,
} from '@midwayjs/core';
import { groupBy, random as randomLodash } from 'lodash-es';
import pm2 from 'pm2';
import Events from 'events';

export const EASY_EVENT_MESSAGE = 'easy:event:message';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyEventManager extends Events {
  private app: IMidwayApplication;

  @Config('keys')
  private keys: string;

  private eventData: Record<string, Array<{ module: any; method: string }>> =
    {};

  /**
   * 初始化，加载所有事件模块
   */
  async init(): Promise<void> {
    const eventModules = listModule(EASY_EVENT_MESSAGE);
    for (const module of eventModules) {
      await this.handlerEvent(module);
    }
    await this.commEvent();
    await this.globalEvent();
  }

  /**
   * 发送事件
   * @param event 事件名
   * @param args 参数
   */
  emit(event: string, ...args: any[]): boolean {
    return super.emit(EASY_EVENT_MESSAGE, {
      type: EASY_EVENT_MESSAGE,
      data: {
        event,
        args,
      },
    });
  }

  /**
   * 发送全局事件，可选是否随机发给一个进程
   * @param event 事件名
   * @param random 是否随机
   * @param args 参数
   */
  async globalEmit(
    event: string,
    random = false,
    ...args: any[]
  ): Promise<void> {
    if (this.app.getEnv() === 'local') {
      this.emit(event, ...args);
      return;
    }
    pm2.connect(() => {
      pm2.list((err, list) => {
        const processes = list.map(e => ({ id: e.pm_id, name: e.name }));
        if (random) {
          const groupedByName = groupBy(processes, 'name');
          for (const [name, group] of Object.entries(groupedByName)) {
            const selectedProcess = group[randomLodash(0, group.length - 1)];
            pm2.sendDataToProcessId(
              selectedProcess.id,
              {
                type: 'process:msg',
                data: {
                  type: `${EASY_EVENT_MESSAGE}@${this.keys}`,
                  event,
                  args,
                },
                id: selectedProcess.id,
                topic: 'easy:event:topic',
              },
              (err, res) => {}
            );
          }
        } else {
          processes.forEach(process => {
            pm2.sendDataToProcessId(
              process.id,
              {
                type: 'process:msg',
                data: {
                  type: `${EASY_EVENT_MESSAGE}@${this.keys}`,
                  event,
                  args,
                },
                id: process.id,
                topic: 'easy:event:topic',
              },
              (err, res) => {}
            );
          });
        }
      });
    });
  }

  /**
   * 处理模块中定义的事件
   * @param module 模块
   */
  private async handlerEvent(module: any): Promise<void> {
    const events = getClassMetadata(EASY_EVENT_MESSAGE, module);
    for (const event of events) {
      const methodName = event.eventName || event.propertyKey;
      if (!this.eventData[methodName]) {
        this.eventData[methodName] = [];
      }
      this.eventData[methodName].push({ module, method: event.propertyKey });
    }
  }

  /**
   * 处理全局事件
   */
  private async globalEvent(): Promise<void> {
    process.on('message', async message => {
      // @ts-ignore
      if (message?.data?.type !== `${EASY_EVENT_MESSAGE}@${this.keys}`) return;
      await this.doAction(message);
    });
  }

  /**
   * 处理普通事件
   */
  private async commEvent(): Promise<void> {
    this.on(EASY_EVENT_MESSAGE, async message => {
      await this.doAction(message);
    });
  }

  /**
   * 执行事件动作
   * @param message 消息
   */
  private async doAction(message: any): Promise<void> {
    console.log('doAction', message);

    const { event, args } = message.data;
    const eventData = this.eventData[event];
    if (eventData) {
      for (const { module, method } of eventData) {
        const moduleInstance = await this.app
          .getApplicationContext()
          .getAsync(module);
        moduleInstance[method](...args);
      }
    }
  }
}
