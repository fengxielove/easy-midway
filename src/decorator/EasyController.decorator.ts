import { CurdOption, RouterOptions } from '@/@types/easy-controller.js';
import {
  attachClassMetadata,
  saveClassMetadata,
  saveModule,
  WEB_ROUTER_KEY,
  CONTROLLER_KEY,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

export const EASY_CONTROLLER_KEY = 'easy-controller';
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
    if (curdOption.api && curdOption.api.length > 0) {
      console.log(curdOption.entity);
      curdOption.api.forEach(apiName => {
        target.prototype[apiName] = defaultHandler(apiName, curdOption!.entity);
      });
    }

    // 将装饰的类，绑定到该装饰器，用于后续能够获取到 class
    saveModule(CONTROLLER_KEY, target);
    saveMetaData(curdOption.prefix, curdOption, routerOptions, target);
  };
}

const defaultHandler = (method: string, entity) => async (ctx: Context) => {
  if (method === 'add') {
    const result = await entity.save(ctx.request.body);
    return result;
  } else {
    return '待开发';
  }
};

const saveMetaData = (
  prefix: string,
  curdOption: CurdOption,
  routerOptions: RouterOptions,
  target: any
) => {
  // 保存一些元数据信息
  saveClassMetadata(
    CONTROLLER_KEY,
    { prefix, routerOptions, curdOption },
    target
  );

  if (curdOption.api && curdOption.api.length > 0) {
    curdOption.api.forEach(apiName => {
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
