import { MidwayConfig } from '@midwayjs/core';
import { uploadWhiteList } from '@midwayjs/upload';
import { join } from 'path';
import { tmpdir } from 'os';
import { LoggerInfo } from '@midwayjs/logger';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1713627126398_579',
  koa: {
    port: 7001,
  },
  validate: {
    validationOptions: {
      // 设置允许有 未定义校验的参数传递
      allowUnknown: true,
      // 剔除传入的未定义参数
      stripUnknown: true,
    },
  },
  upload: {
    mode: 'file',
    fileSize: '100mb',
    whitelist: uploadWhiteList.filter(ext => ext !== '.pdf'),
    tmpdir: join(tmpdir(), 'midway-upload-files'),
    cleanTimeout: 5 * 60 * 1000,
    base64: false,
    // 仅在匹配路径到 /api/upload 的时候去解析 body 中的文件信息
    match: /\/file\/upload/,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '01023612',
        database: 'build-midway',
        synchronize: true,
        logging: false,
        entities: ['**/modules/*/entity'],
      },
    },
  },
  easy: {
    initDB: false,
    initMenu: true,
    crud: {
      softDelete: true,
      pageSize: 15,
    },
    eps: true,
  },
  cacheManager: {
    clients: {
      default: {
        store: 'memory',
      },
    },
  },
} as MidwayConfig;
