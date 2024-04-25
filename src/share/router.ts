import { IMidwayApplication, MidwayWebRouterService } from '@midwayjs/core';
import { getAllController } from './utils.js';
export class AppModuleLoader {
  constructor(
    private app: IMidwayApplication,
    private webRouterService: MidwayWebRouterService
  ) {}

  /**
   * 自动生成加载路由表
   * 路由规则：controller 下的文件名 + modules 下的模块名 + controller 的方法名
   * 例如：/common/user/infocommon
   */
  async loadModules() {
    const files = await getAllController(this.app.getBaseDir());
    for await (const file of files) {
      const noSuffixPath = file.replace(/\.js$/, '');
      let prefix = '';
      const match = noSuffixPath.match(/modules\/(.+)/);
      if (match) {
        const splitPath = match[1].split('/');
        const afterPath = splitPath.slice(3, splitPath.length);
        const fullPath = [splitPath[2], splitPath[0], ...afterPath];
        prefix = fullPath.join('/');
      }
      const module = await import(file);
      const controllerClass = Object.values(module)[0]; // 获取导出的控制器类
      this.webRouterService.addController(controllerClass, {
        prefix: prefix,
      });
    }
  }
}
