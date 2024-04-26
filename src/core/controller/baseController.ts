import {
  App,
  CONTROLLER_KEY,
  IMidwayContainer,
  Init,
  Inject,
  Provide,
  getClassMetadata,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { GlobalConfig } from '../constant/glotbal.js';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { CurdOption } from './types.js';
import { BaseService } from '../service/baseService.js';

@Provide()
export class BaseController {
  @Inject('ctx')
  baseCtx: Context;

  @Inject()
  baseService: BaseService;

  @App()
  private baseApp: IMidwayContainer;

  @Inject()
  private typeORMDataSourceManager: TypeORMDataSourceManager;

  private connectionName: string;
  private curdOption: CurdOption;

  @Init()
  async init(): Promise<void> {
    const options = getClassMetadata(CONTROLLER_KEY, this);
    this.curdOption = options.curdOption;

    if (!this.curdOption) {
      return;
    }

    // 操作之前
    await this.before(this.curdOption);
    // 设置 service
    await this.setService(this.curdOption);
    // 设置实体
    await this.setEntity(this.curdOption);
  }

  private async before(curdOption: CurdOption) {
    if (curdOption.before) {
      curdOption.before(this.baseCtx, this.baseApp);
    }
  }

  private async insertParam(curdOption: CurdOption): Promise<void> {
    if (curdOption.insertParam) {
      this.baseCtx.request.body = {
        // @ts-ignore
        ...this.baseCtx.request.body,
        // @ts-ignore
        ...(await curdOption.insertParam(this.baseCtx, this.baseApp)),
      };
    }
  }

  private async setService(curdOption: CurdOption): Promise<void> {
    if (curdOption.service) {
      this.baseService = await this.baseCtx.requestContext.getAsync(
        curdOption.service
      );
    }
  }

  private async setEntity(curdOption: CurdOption): Promise<void> {
    const entity = curdOption.entity;
    if (entity) {
      const dataSourceName =
        this.typeORMDataSourceManager.getDataSourceNameByModel(entity);
      this.connectionName = dataSourceName;
      let entityModel = this.typeORMDataSourceManager
        .getDataSource(dataSourceName)
        .getRepository(entity);
      this.baseService.setEntity(entityModel);
    }
  }

  /**
   * 新增
   * @returns
   */
  async add() {
    // 插入参数
    await this.insertParam(this.curdOption);
    const { body } = this.baseCtx.request;
    return this.ok(await this.baseService.add(body));
  }

  /**
   * 删除
   * @returns
   */
  async delete() {
    // @ts-ignore
    const { ids } = this.baseCtx.request.body;
    return this.ok(await this.baseService.delete(ids));
  }
  /**
   * 更新
   * @returns
   */
  async update() {
    const { body } = this.baseCtx.request;
    return this.ok(await this.baseService.update(body));
  }

  /**
   * 分页查询
   * @returns
   */
  async page() {
    const { body } = this.baseCtx.request;
    return this.ok(
      await this.baseService.page(
        body,
        this.curdOption.pageQueryOp,
        this.connectionName
      )
    );
  }
  /**
   * 列表查询
   * @returns
   */
  async list() {
    const { body } = this.baseCtx.request;
    return this.ok(
      await this.baseService.list(
        body,
        this.curdOption.listQueryOp,
        this.connectionName
      )
    );
  }

  /**
   * 根据ID查询信息
   * @returns
   */
  async info() {
    const { id } = this.baseCtx.query;
    return this.ok(
      await this.baseService.info(id, this.curdOption.infoIgnoreProperty)
    );
  }

  /**
   * 请求成功的返回数据
   * @param data
   * @returns
   */
  ok(data: any) {
    const { RESCODE, RESMESSAGE } = GlobalConfig.getInstance();
    const res = {
      code: RESCODE.SUCCESS,
      message: RESMESSAGE.SUCCESS,
    };

    if (data || data === 0) {
      res['data'] = data;
    }

    return res;
  }

  /**
   * 失败返回
   * @param message
   * @param code
   */
  fail(message: string, code: number) {
    const { RESCODE, RESMESSAGE } = GlobalConfig.getInstance();
    return {
      code: code ? code : RESCODE.COMMFAIL,
      message: message
        ? message
        : code === RESCODE.VALIDATEFAIL
        ? RESMESSAGE.VALIDATEFAIL
        : RESMESSAGE.COMMFAIL,
    };
  }
}
