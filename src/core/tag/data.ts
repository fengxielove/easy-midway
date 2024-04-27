import { EASY_METHOD_TAG_KEY, EASY_URL_TAG_KEY } from '@/core/decorator/tag.js';
import {
  CONTROLLER_KEY,
  Provide,
  Scope,
  ScopeEnum,
  WEB_ROUTER_KEY,
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
} from '@midwayjs/core';
import { find, startsWith, uniq } from 'lodash-es';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyUrlTagData {
  private data: Record<string, string[]> = {};

  /**
   * 初始化，收集所有标记了 URL 标签的控制器和方法信息
   */
  async init(): Promise<void> {
    const tags = listModule(EASY_URL_TAG_KEY);
    for (const controller of tags) {
      const controllerOption = getClassMetadata(CONTROLLER_KEY, controller);
      const tagOption = getClassMetadata(EASY_URL_TAG_KEY, controller);
      if (tagOption?.key) {
        const data = this.data[tagOption.key] || [];
        this.data[tagOption.key] = uniq([
          ...data,
          ...(tagOption.value || []).map(
            (e: string) => `${controllerOption.prefix}/${e}`
          ),
        ]);
      }

      const listPropertyMetas = listPropertyDataFromClass(
        EASY_METHOD_TAG_KEY,
        controller
      );
      const requestMetas = getClassMetadata(WEB_ROUTER_KEY, controller);
      for (const propertyMeta of listPropertyMetas) {
        const _data = this.data[propertyMeta.tag] || [];
        const requestMeta = find(requestMetas, { method: propertyMeta.key });
        if (requestMeta) {
          this.data[propertyMeta.tag] = uniq([
            ..._data,
            `${controllerOption.prefix}${requestMeta.path}`,
          ]);
        }
      }
    }
  }

  /**
   * 根据键和类型获取数据
   * @param key 键
   * @param type 类型
   * @returns 匹配的 URL 列表
   */
  byKey(key: string, type?: string): string[] {
    return (
      this.data[key]?.filter(e => (type ? startsWith(e, `/${type}/`) : true)) ||
      []
    );
  }
}
