import { GlobalConfig, RESCODE, RESMESSAGE } from '../constant/glotbal.js';
import { BaseException } from './base.js';

export class EasyCoreException extends BaseException {
  constructor(message: string) {
    const { RESCODE, RESMESSAGE } = GlobalConfig.getInstance();
    super(
      'EasyCoreException',
      RESCODE.VALIDATEFAIL,
      message || RESMESSAGE.VALIDATEFAIL
    );
  }
}
