import {
  Init,
  Inject,
  InjectClient,
  MidwayDecoratorService,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';

import { EasyUrlTagData } from '@/core/tag/data.js';
import { EASY_CACHE } from './cache.js';
import { EASY_TRANSACTION } from './transaction.js';
import md5 from 'md5';
import { EasyCommException } from '@/core/exception/comm.js';
import { CachingFactory, Caching } from '@midwayjs/cache-manager';

@Provide()
@Scope(ScopeEnum.Singleton)
export class EasyDecorator {
  @Inject()
  private typeORMDataSourceManager: TypeORMDataSourceManager;

  @Inject()
  private decoratorService: MidwayDecoratorService;

  @InjectClient(CachingFactory, 'default')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private midwayCache: Caching;

  @Inject()
  private easyUrlTagData: EasyUrlTagData;

  @Init()
  async init(): Promise<void> {
    console.log('装饰器的 初始化');
    await this.transaction();
    await this.cache();
    await this.easyUrlTagData.init();
  }

  private async cache() {
    this.decoratorService.registerMethodHandler(EASY_CACHE, options => ({
      around: async joinPoint => {
        const key = md5(
          joinPoint.target.constructor.name +
            joinPoint.methodName +
            JSON.stringify(joinPoint.args)
        );
        let data = await this.midwayCache.get(key);
        if (data) {
          return JSON.parse(data);
        } else {
          data = await joinPoint.proceed(...joinPoint.args);
          await this.midwayCache.set(key, JSON.stringify(data), {
            ttl: options.metadata.ttl,
          });
        }
        return data;
      },
    }));
  }

  private async transaction(): Promise<void> {
    this.decoratorService.registerMethodHandler(EASY_TRANSACTION, options => ({
      around: async joinPoint => {
        const option = options.metadata;
        const dataSource = this.typeORMDataSourceManager.getDataSource(
          option?.connectionName || 'default'
        );
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
          if (option?.isolation) {
            await queryRunner.startTransaction(option.isolation);
          } else {
            await queryRunner.startTransaction();
          }
          joinPoint.args.push(queryRunner);
          const data = await joinPoint.proceed(...joinPoint.args);
          await queryRunner.commitTransaction();
          return data;
        } catch (error) {
          throw new EasyCommException(error.message);
        } finally {
          await queryRunner.release();
        }
      },
    }));
  }
}
