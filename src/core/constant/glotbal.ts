// 定义返回码枚举
export enum RESCODE {
  SUCCESS = 1000, // 成功
  COMMFAIL = 1001, // 失败
  VALIDATEFAIL = 1002, // 参数验证失败
  COREFAIL = 1003, // 核心异常
}

// 定义返回信息枚举
export enum RESMESSAGE {
  SUCCESS = 'success',
  COMMFAIL = 'comm fail',
  VALIDATEFAIL = 'validate fail',
  COREFAIL = 'core fail',
}

// 定义错误提示枚举
export enum ERRINFO {
  NOENTITY = '未设置操作实体',
  NOID = '查询参数[id]不存在',
  SORTFIELD = '排序参数不正确',
}

// 定义事件枚举
export enum EVENT {
  SOFT_DELETE = 'onSoftDelete', // 软删除
  SERVER_READY = 'onServerReady', // 服务成功启动
  READY = 'onReady', // 服务就绪
  ES_DATA_CHANGE = 'esDataChange', // ES 数据改变
}

// 定义全局配置类
export class GlobalConfig {
  private static instance: GlobalConfig;

  public RESCODE: { [key in keyof typeof RESCODE]: RESCODE };
  public RESMESSAGE: { [key in keyof typeof RESMESSAGE]: string };

  private constructor() {
    this.RESCODE = {
      SUCCESS: RESCODE.SUCCESS,
      COMMFAIL: RESCODE.COMMFAIL,
      VALIDATEFAIL: RESCODE.VALIDATEFAIL,
      COREFAIL: RESCODE.COREFAIL,
    };

    this.RESMESSAGE = {
      SUCCESS: RESMESSAGE.SUCCESS,
      COMMFAIL: RESMESSAGE.COMMFAIL,
      VALIDATEFAIL: RESMESSAGE.VALIDATEFAIL,
      COREFAIL: RESMESSAGE.COREFAIL,
    };
  }

  public static getInstance(): GlobalConfig {
    if (!GlobalConfig.instance) {
      GlobalConfig.instance = new GlobalConfig();
    }
    return GlobalConfig.instance;
  }
}
