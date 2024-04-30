import { Init, Logger, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import moment from 'moment';
@Provide()
@Scope(ScopeEnum.Singleton)
export class FuncUtil {
  @Logger()
  coreLogger: any;

  @Init()
  async init() {
    Date.prototype.toJSON = function () {
      return moment(this).format('YYYY-MM-DD HH:mm:ss');
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    String.prototype['replaceAll'] = function (
      search: string,
      replacement: string
    ): string {
      return this.replace(new RegExp(search, 'gm'), replacement);
    };

    this.coreLogger.init(
      '\x1B[36m [easy:core] midwayjs easy core func handler \x1B[0m'
    );
  }
}
