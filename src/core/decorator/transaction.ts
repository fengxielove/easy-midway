import { createCustomMethodDecorator } from '@midwayjs/core';

export const EASY_TRANSACTION = 'decorator:easy_transaction';

interface TransactionOptions {
  // 根据需要定义选项，例如 isolation level 或其他数据库事务相关的选项
  isolationLevel?: string;
}

/**
 * 事务装饰器，用于标记方法在事务中执行。
 * @param option 可选的配置对象
 * @returns 方法装饰器
 */
export function EasyTransaction(option?: TransactionOptions): MethodDecorator {
  return createCustomMethodDecorator(EASY_TRANSACTION, option);
}
