import { createCustomMethodDecorator } from '@midwayjs/core';
// 装饰器内部的唯一 id
export const EASY_CACHE = 'decorator:easy_cache';

/**
 * Method decorator to enable caching with an optional TTL (time to live).
 * @param ttl Time to live for the cache in seconds (optional).
 * @returns Method decorator that enhances a method with caching capabilities.
 */
export function EasyCache(ttl?: number): MethodDecorator {
  return createCustomMethodDecorator(EASY_CACHE, { ttl });
}
