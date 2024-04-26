import { GlobalConfig } from '../constant/glotbal.js';
import { BaseException } from './base.js';

/**
 * 校验异常类
 */
export class EasyValidateException extends BaseException {
  constructor(message?: string) {
    const { RESCODE, RESMESSAGE } = GlobalConfig.getInstance();
    super(
      'EasyValidateException',
      RESCODE.VALIDATEFAIL,
      message || RESMESSAGE.VALIDATEFAIL
    );
  }
}
