import { UserMiddleware } from '@/middleware/user.middleware.js';

export default () => {
  return {
    name: '在线书城',
    description: '描述信息',
    globalMiddlewares: [UserMiddleware],
    jwt: {
      // 是否单点登录
      sso: false,
      secret: 'fengxie.jwt.token',
      token: {
        // 两小时过期，需要刷新token
        expire: 2 * 3600,
        // 15天内，如果没有操作就需要重新登录
        refreshExpire: 24 * 3600 * 15,
      },
    },
  };
};
