import {
  App,
  Config,
  Context,
  IMidwayContainer,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { isEmpty } from 'lodash-es';
import * as SqlString from 'sqlstring';
import { EasyValidateException } from '../exception/validate.js';
import { ERRINFO, EVENT } from '../constant/glotbal.js';
import { Brackets, Equal, In } from 'typeorm';
import { EasyEventManager } from '../event/index.js';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class BaseMysqlService {
  private entity: any;
  private sqlParams: any[];

  @Config('easy')
  private _easyConfig: any;

  @Inject()
  private typeORMDataSourceManager: TypeORMDataSourceManager;

  @Inject()
  private easyEventManager: EasyEventManager;

  @App()
  private baseApp: IMidwayContainer;

  @Inject('ctx')
  private baseCtx: Context;

  @Init()
  init() {
    console.log('_easyConfig', this._easyConfig);
    this.sqlParams = [];
  }
  // 设置模型
  setEntity(entity: any) {
    this.entity = entity;
  }
  // 设置请求上下文
  setCtx(ctx: any) {
    this.baseCtx = ctx;
  }
  // 设置应用对象
  setApp(app: any) {
    this.baseApp = app;
  }

  /**
   * 设置sql
   * @param condition 条件是否成立
   * @param sql sql语句
   * @param params 参数
   */
  setSql(condition: any, sql: string, params: any[]): string {
    let rSql = false;
    if (condition || (condition === 0 && condition !== '')) {
      rSql = true;
      this.sqlParams = this.sqlParams.concat(params);
    }
    return rSql ? sql : '';
  }

  /**
   * 获得查询个数的SQL
   * @param sql
   */
  getCountSql(sql: string): string {
    sql = sql.replace(/LIMIT/gm, 'limit ').replace(/\n/gm, ' ');
    if (sql.includes('limit')) {
      const sqlArr = sql.split('limit ');
      sqlArr.pop();
      sql = sqlArr.join('limit ');
    }
    return `select count(*) as count from (${sql}) a`;
  }

  /**
   * 参数安全性检查
   * @param params
   */
  async paramSafetyCheck(params: string): Promise<boolean> {
    const lp = params.toLowerCase();
    return !(
      lp.includes('update ') ||
      lp.includes('select ') ||
      lp.includes('delete ') ||
      lp.includes('insert ')
    );
  }

  /**
   * 原生查询
   * @param sql
   * @param params
   * @param connectionName
   */
  async nativeQuery(sql: string, params: any[], connectionName: string) {
    if (isEmpty(params)) {
      params = this.sqlParams;
    }
    let newParams = [...params];
    this.sqlParams = [];
    newParams = newParams.map(param => SqlString.escape(param));
    const manager = this.getOrmManager(connectionName);
    return await manager.query(sql, newParams);
  }

  /**
   * 获得ORM管理
   *  @param connectionName 连接名称
   */
  getOrmManager(connectionName: string = 'default') {
    return this.typeORMDataSourceManager.getDataSource(connectionName);
  }

  /**
   * 操作entity获得分页数据，不用写sql
   * @param find QueryBuilder
   * @param query
   * @param autoSort
   * @param connectionName
   */
  async entityRenderPage(find, query, autoSort = true) {
    const {
      size = this._easyConfig.crud.pageSize || 10,
      page = 1,
      order = 'createTime',
      sort = 'desc',
      isExport = false,
      maxExportLimit,
    } = query;
    const count = await find.getCount();
    let dataFind;
    if (isExport && maxExportLimit > 0) {
      dataFind = find.limit(maxExportLimit);
    } else {
      dataFind = find.offset((page - 1) * size).limit(size);
    }
    if (autoSort) {
      find.addOrderBy(order, sort.toUpperCase());
    }
    return {
      list: await dataFind.getMany(),
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: count,
      },
    };
  }

  /**
   * 执行SQL并获得分页数据
   * @param sql 执行的sql语句
   * @param query 分页查询条件
   * @param autoSort 是否自动排序
   * @param connectionName 连接名称
   */
  async sqlRenderPage(sql, query, autoSort = true, connectionName: string) {
    const {
      size = this._easyConfig.crud.pageSize,
      page = 1,
      order = 'createTime',
      sort = 'desc',
      isExport = false,
      maxExportLimit,
    } = query;
    if (order && sort && autoSort) {
      if (!(await this.paramSafetyCheck(order + sort))) {
        throw new EasyValidateException('非法传参~');
      }
      sql += ` ORDER BY ${SqlString.escapeId(order)} ${this.checkSort(sort)}`;
    }
    if (isExport && maxExportLimit > 0) {
      this.sqlParams.push(parseInt(maxExportLimit));
      sql += ' LIMIT ? ';
    }
    if (!isExport) {
      this.sqlParams.push((page - 1) * size);
      this.sqlParams.push(parseInt(size));
      sql += ' LIMIT ?,? ';
    }
    let params = [];
    params = params.concat(this.sqlParams);
    const result = await this.nativeQuery(sql, params, connectionName);
    const countResult = await this.nativeQuery(
      this.getCountSql(sql),
      params,
      connectionName
    );
    return {
      list: result,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: parseInt(countResult[0] ? countResult[0].count : 0),
      },
    };
  }

  /**
   * 检查排序
   * @param sort 排序
   * @returns
   */
  checkSort(sort) {
    if (!['desc', 'asc'].includes(sort.toLowerCase())) {
      throw new EasyValidateException('sort 非法传参~');
    }
    return sort;
  }

  /**
   * 获得单个ID
   * @param id ID
   * @param infoIgnoreProperty 忽略返回属性
   */
  async info(id: number | string, infoIgnoreProperty: string[]) {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);
    if (!id) {
      throw new EasyValidateException(ERRINFO.NOID);
    }
    const info = await this.entity.findOneBy({ id });
    if (info && infoIgnoreProperty) {
      for (const property of infoIgnoreProperty) {
        delete info[property];
      }
    }
    return info;
  }

  /**
   * 删除
   * @param ids 删除的ID集合 如：[1,2,3] 或者 1,2,3
   */
  async delete<T>(ids: T | T[]) {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);

    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    // 启动软删除发送事件
    if (this._easyConfig.crud?.softDelete) {
      this.softDelete(ids as T[]);
    }
    await this.entity.delete(ids);
  }

  /**
   * 软删除
   * @param ids 删除的ID数组
   * @param entity 实体
   */
  async softDelete<T>(ids: T[], entity?: null) {
    const data = await this.entity.find({
      where: {
        id: In(ids),
      },
    });
    if (isEmpty(data)) return;
    const _entity = entity ? entity : this.entity;
    const params = {
      data,
      ctx: this.baseCtx,
      entity: _entity,
    };
    if (data.length > 0) {
      // 启动软删除发送事件
      this.easyEventManager.emit(EVENT.SOFT_DELETE, params);
    }
  }

  /**
   * 新增|修改
   * @param param 数据
   */
  async addOrUpdate(param, type = 'add') {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);

    if (!Array.isArray(param)) {
      delete param.createTime;
    }
    // 判断是否是批量操作

    if (Array.isArray(param)) {
      param.forEach(item => {
        item.updateTime = new Date();
        item.createTime = new Date();
      });
      await this.entity.save(param);
    } else {
      const upsert = this._easyConfig.crud?.upsert || 'normal';
      if (type === 'update') {
        if (upsert == 'save') {
          const info = await this.entity.findOneBy({ id: param.id });
          param = {
            ...info,
            ...param,
          };
        }
        param.updateTime = new Date();
        upsert === 'normal'
          ? await this.entity.update(param.id, param)
          : await this.entity.save(param);
      } else if (type == 'add') {
        param.createTime = new Date();
        param.updateTime = new Date();
        upsert == 'normal'
          ? await this.entity.insert(param)
          : await this.entity.save(param);
      }
    }
  }

  /**
   * 非分页查询
   * @param query 查询条件
   * @param option 查询配置
   * @param connectionName 连接名
   */
  async list(query, option, connectionName: string) {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);
    const sql = await this.getOptionFind(query, option);
    return this.nativeQuery(sql, [], connectionName);
  }

  /**
   * 分页查询
   * @param query 查询条件
   * @param option 查询配置
   * @param connectionName 连接名
   */
  async page(query, option, connectionName) {
    if (!this.entity) throw new EasyValidateException(ERRINFO.NOENTITY);
    const sql = await this.getOptionFind(query, option);
    return this.sqlRenderPage(sql, query, false, connectionName);
  }

  /**
   * 构建查询配置
   * @param query 前端查询
   * @param option
   */
  async getOptionFind(query, option) {
    let { order = 'createTime', sort = 'desc', keyWord = '' } = query;
    const sqlArr = ['SELECT'];
    const selects = ['a.*'];
    const find = this.entity.createQueryBuilder('a');
    if (option) {
      if (typeof option == 'function') {
        // @ts-ignore
        option = await option(this.baseCtx, this.baseApp);
      }
      // 判断是否有关联查询，有的话取个别名
      if (!isEmpty(option.join)) {
        for (const item of option.join) {
          selects.push(`${item.alias}.*`);
          find[item.type || 'leftJoin'](
            item.entity,
            item.alias,
            item.condition
          );
        }
      }
      // 默认条件
      if (option.where) {
        const wheres =
          typeof option.where == 'function'
            ? await option.where(this.baseCtx, this.baseApp)
            : option.where;
        if (!isEmpty(wheres)) {
          for (const item of wheres) {
            if (
              item.length == 2 ||
              (item.length == 3 &&
                (item[2] || (item[2] === 0 && item[2] != '')))
            ) {
              for (const key in item[1]) {
                this.sqlParams.push(item[1][key]);
              }
              find.andWhere(item[0], item[1]);
            }
          }
        }
      }
      // 附加排序
      if (!isEmpty(option.addOrderBy)) {
        for (const key in option.addOrderBy) {
          if (order && order == key) {
            sort = option.addOrderBy[key].toUpperCase();
          }
          find.addOrderBy(
            SqlString.escapeId(key),
            this.checkSort(option.addOrderBy[key].toUpperCase())
          );
        }
      }
      // 关键字模糊搜索
      if (keyWord || (keyWord == 0 && keyWord != '')) {
        keyWord = `%${keyWord}%`;
        find.andWhere(
          new Brackets(qb => {
            const keyWordLikeFields = option.keyWordLikeFields || [];
            for (const field of keyWordLikeFields) {
              qb.orWhere(`${field} LIKE :keyWord`, { keyWord });
              this.sqlParams.push(keyWord);
            }
          })
        );
      }
      // 筛选字段
      if (!isEmpty(option.select)) {
        sqlArr.push(option.select.join(','));
        find.select(option.select);
      } else {
        sqlArr.push(selects.join(','));
      }
      // 字段全匹配
      if (!isEmpty(option.fieldEq)) {
        for (let key of option.fieldEq) {
          const c = {};
          // 如果key有包含.的情况下操作
          if (typeof key === 'string' && key.includes('.')) {
            const keys = key.split('.');
            const lastKey = keys.pop();
            key = { requestParam: lastKey, column: key };
          }
          // 单表字段无别名的情况下操作
          if (typeof key === 'string') {
            if (query[key] || (query[key] == 0 && query[key] == '')) {
              c[key] = query[key];
              const eq = query[key] instanceof Array ? 'in' : '=';
              if (eq === 'in') {
                find.andWhere(`${key} ${eq} (:${key})`, c);
              } else {
                find.andWhere(`${key} ${eq} :${key}`, c);
              }
              this.sqlParams.push(query[key]);
            }
          } else {
            if (
              query[key.requestParam] ||
              (query[key.requestParam] == 0 && query[key.requestParam] !== '')
            ) {
              c[key.column] = query[key.requestParam];
              const eq = query[key.requestParam] instanceof Array ? 'in' : '=';
              if (eq === 'in') {
                find.andWhere(`${key.column} ${eq} (:${key.column})`, c);
              } else {
                find.andWhere(`${key.column} ${eq} :${key.column}`, c);
              }
              this.sqlParams.push(query[key.requestParam]);
            }
          }
        }
      }
    } else {
      sqlArr.push(selects.join(','));
    }
    // 接口请求的排序
    if (sort && order) {
      const sorts = sort.toUpperCase().split(',');
      const orders = order.split(',');
      if (sorts.length != orders.length) {
        throw new EasyValidateException(ERRINFO.SORTFIELD);
      }
      for (const i in sorts) {
        find.addOrderBy(
          SqlString.escapeId(orders[i]),
          this.checkSort(sorts[i])
        );
      }
    }
    if (option === null || option === void 0 ? void 0 : option.extend) {
      await (option === null || option === void 0
        ? void 0
        : option.extend(find, this.baseCtx, this.baseApp));
    }
    const sqls = find.getSql().split('FROM');
    sqlArr.push('FROM');
    // 取sqls的最后一个
    sqlArr.push(sqls[sqls.length - 1]);
    return sqlArr.join(' ');
  }
}
