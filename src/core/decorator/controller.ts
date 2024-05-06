import {
  attachClassMetadata,
  CONTROLLER_KEY,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
  WEB_ROUTER_KEY,
} from '@midwayjs/core';
import { CurdOption, RouterOptions } from '../controller/types.js';

import LocationUtil from '@/core/util/location.js';
import os from 'os';
import fs from 'fs';
import { endsWith, isEmpty } from 'lodash-es';

export const apiDesc = {
  add: '新增',
  delete: '删除',
  update: '修改',
  page: '分页查询',
  list: '列表查询',
  info: '单个信息',
};

export function EasyController(
  curdOption?: CurdOption | string | RouterOptions,
  routerOptions = { middleware: [], sensitive: true }
): ClassDecorator {
  return (target: any) => {
    // 将装饰的类，绑定到该装饰器，用于后续能够获取到 class
    saveModule(CONTROLLER_KEY, target);

    let prefix: string;
    if (curdOption) {
      if (typeof curdOption === 'string') {
        prefix = curdOption;
      } else if (curdOption && 'api' in curdOption) {
        prefix = curdOption.prefix || '';
      } else {
        routerOptions = {
          ...curdOption,
          ...routerOptions,
        };
      }
    }

    // 如果不存在路由前缀，那么自动根据当前文件夹路径生成路由前缀
    LocationUtil.scriptPath(target).then(async res => {
      const pathSps = res.path.split('.');
      const paths = pathSps[pathSps.length - 2].split('/');
      const pathArr = [];
      let module = null;
      for (const path of paths.reverse()) {
        if (path !== 'controller' && !module) {
          pathArr.push(path);
        }
        if (path === 'controller' && !paths.includes('modules')) {
          break;
        }
        if (path === 'controller' && paths.includes('modules')) {
          module = 'ready';
        }
        if (module && path !== 'controller') {
          module = `${path}`;
          break;
        }
      }
      if (module) {
        pathArr.reverse();
        pathArr.splice(1, 0, module);
        // 追加模块中间件
        let path = `${
          res.path.split(`modules/${module}`)[0]
        }modules/${module}/config.${endsWith(res.path, 'ts') ? 'ts' : 'js'}`;
        if (os.type() === 'Windows_NT') {
          path = path.substring(1);
        }
        if (fs.existsSync(path)) {
          const config = (await import(path)).default();
          // console.log('config', config);
          routerOptions.middleware = (config.middlewares || []).concat(
            routerOptions.middleware || []
          );
        }
      }
      if (!prefix) {
        prefix = `/${pathArr.join('/')}`;
      }

      saveMetaData({ prefix, routerOptions, target, curdOption, module });
    });

    // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
    // Scope(ScopeEnum.Request)(target);
    // // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
    // Provide()(target);
  };
}

const saveMetaData = ({
  prefix,
  curdOption,
  routerOptions,
  target,
  module,
}: {
  prefix: string;
  curdOption: CurdOption | string | RouterOptions;
  routerOptions: RouterOptions;
  target: any;
  module?: any;
}) => {
  if (module && !routerOptions.tagName) {
    routerOptions = routerOptions || {};
    routerOptions.tagName = module;
  }

  saveClassMetadata(
    CONTROLLER_KEY,
    {
      prefix,
      routerOptions,
      curdOption,
      module,
    },
    target
  );

  //   追加 CRUD 路由
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if ('api' in curdOption && !isEmpty(curdOption.api)) {
    curdOption?.api.forEach(path => {
      attachClassMetadata(
        WEB_ROUTER_KEY,
        {
          path: `/${path}`,
          requestMethod: path === 'info' ? 'get' : 'post',
          method: path,
          summary: apiDesc[path],
          description: '',
        },
        target
      );
    });

    Scope(ScopeEnum.Request)(target);
  }
};
