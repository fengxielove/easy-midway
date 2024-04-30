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
export function EasyUrlTag(data: any): ClassDecorator {
  // data { key: 'ignoreToken' }
  return (target: any) => {
    console.log('target', target);
    // saveModule 用于保存某个类到某个装饰器
    saveModule(EASY_URL_TAG_KEY, target);
    // 保存元信息到 class
    saveClassMetadata(EASY_URL_TAG_KEY, data, target);
  };
}

/**
 * 方法装饰器：用于标记方法
 * @param tag 标记信息
 * @returns 方法装饰器
 */
export function EasyTag(tag: TagTypes): MethodDecorator {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    savePropertyDataToClass(EASY_METHOD_TAG_KEY, { key, tag }, target, key);
    return descriptor;
  };
}
