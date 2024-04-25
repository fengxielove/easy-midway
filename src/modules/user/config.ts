import { ModuleConfig } from '../../@types/interface.js';

export default () => {
  return {
    name: '用户模块',
    description: '用户的登录、注册等基础功能',
    prefix: '',
    globalMiddlewares: [],
    // 模块加载顺序
    order: 10,
    // app 参数配置允许读取的key
    allowKeys: [],
    // jwt 生成解密 token
    jwt: {
      // 单点登录
      sso: false,
      secret: 'fengxie.jwt.token',
      token: {
        // 两小时过期，需要用刷新token
        expire: 2 * 3600,
        // 15 天没有登陆过，则需要重新登陆
        refreshExpire: 24 * 3600 * 15,
      },
    },
  } as ModuleConfig;
};
