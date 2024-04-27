import {
  ApiTypes,
  CurdOption,
  RouterOptions,
} from '@/@types/easy-controller.js';
import {
  attachClassMetadata,
  saveClassMetadata,
  saveModule,
  WEB_ROUTER_KEY,
  CONTROLLER_KEY,
  Scope,
  ScopeEnum,
  Provide,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { difference } from 'lodash-es';
import { BaseEntity } from 'typeorm';

export const apiDesc = {
  add: '新增',
  delete: '删除',
  update: '修改',
  page: '分页查询',
  list: '列表查询',
  info: '单个信息',
};

export function EasyController(
  curdOption: CurdOption,
  routerOptions = { middleware: [], sensitive: true }
): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能够获取到 class
    saveModule(CONTROLLER_KEY, target);
    saveMetaData({
      prefix: curdOption.prefix,
      curdOption,
      routerOptions,
      target,
      // autoApi: differenceApi,
      autoApi: curdOption.api,
    });
    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    Scope(ScopeEnum.Request)(target);
    // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
    Provide()(target);
  };
}

const saveMetaData = ({
  prefix,
  curdOption,
  routerOptions,
  target,
  autoApi = [],
}: {
  prefix: string;
  curdOption: CurdOption;
  routerOptions: RouterOptions;
  target: any;
  autoApi?: string[];
}) => {
  // 保存一些元数据信息
  saveClassMetadata(
    CONTROLLER_KEY,
    { prefix, routerOptions, curdOption },
    target
  );

  if (autoApi.length > 0) {
    autoApi.forEach(apiName => {
      attachClassMetadata(
        WEB_ROUTER_KEY,
        {
          path: `/${apiName}`,
          requestMethod: apiName === 'info' ? 'get' : 'post',
          method: apiName,
          summary: apiDesc[apiName],
          description: '',
        },
        target
      );
    });
  }
};
