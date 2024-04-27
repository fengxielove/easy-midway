import {
  saveClassMetadata,
  saveModule,
  savePropertyDataToClass,
} from '@midwayjs/core';

export const EASY_URL_TAG_KEY = 'decorator:easy:url:tag';
export const EASY_METHOD_TAG_KEY = 'decorator:easy:method:tag';

export enum TagTypes {
  IGNORE_TOKEN = 'ignoreToken',
  IGNORE_SIGN = 'ignoreSign',
}

/**
 * 类装饰器：用于添加 URL 标记
 * @param data 标记数据
 * @returns 类装饰器
 */
function EasyUrlTag(data: any): ClassDecorator {
  return (target: Function) => {
    saveModule(EASY_URL_TAG_KEY, target);
    saveClassMetadata(EASY_URL_TAG_KEY, data, target);
  };
}

/**
 * 方法装饰器：用于标记方法
 * @param tag 标记信息
 * @returns 方法装饰器
 */
function EasyTag(tag: TagTypes): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    savePropertyDataToClass(
      EASY_METHOD_TAG_KEY,
      { tag },
      target,
      propertyKey as string
    );
    return descriptor;
  };
}

export { EasyUrlTag, EasyTag };
