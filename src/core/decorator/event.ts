import {
  Scope,
  ScopeEnum,
  attachClassMetadata,
  saveClassMetadata,
  saveModule,
} from '@midwayjs/core';

interface EasyEventOptions {
  eventName?: string;
}

export const EASY_CLS_EVENT_KEY = 'decorator:easy:cls:event';

function EasyEvent(options: EasyEventOptions = {}): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
    saveModule(EASY_CLS_EVENT_KEY, target);
    // 保存一些元数据信息，任意你希望存的东西
    saveClassMetadata(EASY_CLS_EVENT_KEY, options, target);
    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    Scope(ScopeEnum.Singleton)(target);
  };
}

/**
 * 方法装饰器：定义事件处理函数
 * @param eventName 事件名称
 * @returns 方法装饰器
 */
function Event(eventName: string): MethodDecorator {
  return (
    target,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      EASY_CLS_EVENT_KEY,
      {
        eventName,
        method: propertyKey,
        descriptor,
      },
      target
    );
  };
}
