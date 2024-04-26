import {
  App,
  Config,
  IMidwayApplication,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  Init,
  IMidwayContainer,
} from '@midwayjs/core';
import { BaseMysqlService } from './mysql.js';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { EasyEventManager } from '../event/index.js';
import { Context } from '@midwayjs/koa';
import { EasyCoreException } from '../exception/core.js';
import { EasyValidateException } from '../exception/validate.js';
import { ERRINFO } from '../constant/glotbal.js';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class BaseService {
  @Inject()
  private baseMysqlService: BaseMysqlService;

  @Config('typeorm.dataSource.default.type')
  private ormType: string;

  @Inject()
  private typeORMDataSourceManager: TypeORMDataSourceManager;

  @Inject()
  private easyEventManager: EasyEventManager;

  @Inject('ctx')
  private baseCtx: Context;

  @App()
  private baseApp: IMidwayContainer;

  private service: any;
  private entity: any;
  private sqlParams: any;

  @Init()
  async init(): Promise<void> {
    const services = {
      mysql: this.baseMysqlService,
    };
    this.service = services[this.ormType];
    if (!this.service) {
      throw new EasyCoreException('暂不支持当前数据库类型');
    }
    this.sqlParams = this.service.sqlParams;
    await this.service.init();
  }

  setEntity(entity: any): void {
    this.entity = entity;
    this.service.setEntity(entity);
  }

  setCtx(ctx: Context): void {
    this.baseCtx = ctx;
    this.service.setCtx(ctx);
  }

  setApp(app: IMidwayContainer): void {
    this.baseApp = app;
    this.service.setApp(app);
  }

  /**
   * 设置sql
   * @param condition 条件是否成立
   * @param sql sql语句
   * @param params 参数
   */
  setSql(condition, sql, params) {
    return this.service.setSql(condition, sql, params);
  }
  /**
   * 获得查询个数的SQL
   * @param sql
   */
  getCountSql(sql) {
    return this.service.getCountSql(sql);
  }

  /**
   * 参数安全性检查
   * @param params
   */
  async paramSafetyCheck(params) {
    return await this.service.paramSafetyCheck(params);
  }
  /**
   * 原生查询
   * @param sql
   * @param params
   * @param connectionName
   */
  async nativeQuery(sql, params, connectionName) {
    return await this.service.nativeQuery(sql, params, connectionName);
  }

  /**
   * 获得ORM管理
   *  @param connectionName 连接名称
   */
  getOrmManager(connectionName = 'default') {
    return this.service.getOrmManager(connectionName);
  }
  /**
   * 操作entity获得分页数据，不用写sql
   * @param find QueryBuilder
   * @param query
   * @param autoSort
   * @param connectionName
   */
  async entityRenderPage(find, query, autoSort = true) {
    return await this.service.entityRenderPage(find, query, autoSort);
  }

  /**
   * 执行SQL并获得分页数据
   * @param sql 执行的sql语句
   * @param query 分页查询条件
   * @param autoSort 是否自动排序
   * @param connectionName 连接名称
   */
  async sqlRenderPage(sql, query, autoSort = true, connectionName) {
    return await this.service.sqlRenderPage(
      sql,
      query,
      autoSort,
      connectionName
    );
  }
  /**
   * 获得单个ID
   * @param id ID
   * @param infoIgnoreProperty 忽略返回属性
   */
  async info(id, infoIgnoreProperty) {
    this.service.setEntity(this.entity);
    return await this.service.info(id, infoIgnoreProperty);
  }

  /**
   * 删除
   * @param ids 删除的ID集合 如：[1,2,3] 或者 1,2,3
   */
  async delete(ids) {
    this.service.setEntity(this.entity);
    await this.modifyBefore(ids, 'delete');
    await this.service.delete(ids);
    await this.modifyAfter(ids, 'delete');
  }
  /**
   * 软删除
   * @param ids 删除的ID数组
   * @param entity 实体
   */
  async softDelete(ids, entity) {
    this.service.setEntity(this.entity);
    await this.service.softDelete(ids, entity);
  }

  /**
   * 修改
   * @param param 数据
   */
  async update(param) {
    this.service.setEntity(this.entity);
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);
    if (!param.id && !(param instanceof Array))
      throw new EasyValidateException(ERRINFO.NOID);
    await this.addOrUpdate(param, 'update');
  }

  /**
   * 新增
   * @param param 数据
   */
  async add(param) {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);
    delete param.id;
    await this.addOrUpdate(param, 'add');
    return {
      id:
        param instanceof Array
          ? param.map(e => {
              return e.id ? e.id : e._id;
            })
          : param.id
          ? param.id
          : param._id,
    };
  }

  /**
   * 新增|修改
   * @param param 数据
   */
  async addOrUpdate(param, type = 'add') {
    this.service.setEntity(this.entity);
    await this.modifyBefore(param, type);
    await this.service.addOrUpdate(param, type);
    await this.modifyAfter(param, type);
  }
  /**
   * 非分页查询
   * @param query 查询条件
   * @param option 查询配置
   * @param connectionName 连接名
   */
  async list(query, option, connectionName) {
    this.service.setEntity(this.entity);
    return await this.service.list(query, option, connectionName);
  }

  /**
   * 分页查询
   * @param query 查询条件
   * @param option 查询配置
   * @param connectionName 连接名
   */
  async page(query, option, connectionName) {
    this.service.setEntity(this.entity);
    return await this.service.page(query, option, connectionName);
  }
  /**
   * 构建查询配置
   * @param query 前端查询
   * @param option
   */
  async getOptionFind(query, option) {
    this.service.setEntity(this.entity);
    return await this.service.getOptionFind(query, option);
  }

  /**
   * 新增|修改|删除 之后的操作
   * @param data 对应数据
   */
  async modifyAfter(data, type) {}
  /**
   * 新增|修改|删除 之前的操作
   * @param data 对应数据
   */
  async modifyBefore(data, type) {}
}
