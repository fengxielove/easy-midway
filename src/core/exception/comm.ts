import { GlobalConfig } from '../constant/glotbal.js';
import { BaseException } from './base.js';

export class EasyCommException extends BaseException {
  constructor(message?: string) {
    // 获取全局配置的单例实例
    const { RESCODE, RESMESSAGE } = GlobalConfig.getInstance();
    // 调用基类的构造函数，设置异常类型为'CoolCommException'，
    // 使用全局配置中定义的通用失败响应码，如果提供了消息则使用，否则使用默认消息
    super(
      'EasyCommException',
      RESCODE.COMMFAIL,
      message || RESMESSAGE.COMMFAIL
    );
  }
}
