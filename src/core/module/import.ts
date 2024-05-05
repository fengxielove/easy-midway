import {
  App,
  Config,
  IMidwayApplication,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { InjectDataSource, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { DataSource } from 'typeorm';
import { EasyModuleConfig } from './config.js';
import { EasyEventManager } from '../event/index.js';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyModuleImport {
  @Config('typeorm.dataSource')
  private ormConfig: any;

  @InjectDataSource('default')
  private defaultDataSource: DataSource;

  @Inject()
  private typeORMDataSourceManager: TypeORMDataSourceManager;

  @Config('easy')
  private easyConfig: any;

  @Logger()
  private coreLogger: any;

  @Inject()
  private easyModuleConfig: EasyModuleConfig;

  @Inject()
  private easyEventManager: EasyEventManager;

  @App()
  private app: IMidwayApplication;

  // TODO
  // @Inject()
  // private easyModuleMenu:

  // @Init()
  async init() {
    this.coreLogger.info('module import.ts init');
    if (this.easyConfig.initDB) {
      // const modules = this.easyModuleConfig.modules;
      // const importLockPath = path.
    }
  }
}
