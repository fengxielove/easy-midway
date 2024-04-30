import { Session } from 'node:inspector';
import { promisify } from 'node:util';
import { v1 as uuidV1 } from 'uuid';

class LocationUtil {
  static instance: LocationUtil | null = null;
  PREFIX = '__functionLocation__';
  session: Session;
  scripts: Record<string, any> = {};
  port$: any;

  constructor() {
    if (!LocationUtil.instance) {
      this.init();
      LocationUtil.instance = this;
    }
    return LocationUtil.instance;
  }

  getInstance(): LocationUtil {
    if (!LocationUtil.instance) {
      LocationUtil.instance = new LocationUtil();
    }
    return LocationUtil.instance;
  }

  init() {
    if (!global[this.PREFIX]) {
      global[this.PREFIX] = {};
    }
    if (this.session) {
      return;
    }
    this.session = new Session();
    this.session.connect();
    this.port$ = promisify(this.session.post).bind(this.session);
    this.session.on('Debugger.scriptParsed', (res: any) => {
      this.scripts[res.params.scriptId] = res.params;
      LocationUtil.instance = this;
    });
    this.port$('Debugger.enable').catch(console.error);
    LocationUtil.instance = this;
  }

  /**
   * 获取脚本的位置
   * @param target
   */
  async scriptPath(target) {
    const id = uuidV1();
    global[this.PREFIX][id] = target;
    const evaluated = await this.port$('Runtime.evaluate', {
      expression: `global['${this.PREFIX}']['${id}']`,
      objectGroup: this.PREFIX,
    });

    const properties = await this.port$('Runtime.getProperties', {
      objectId: evaluated.result.objectId,
    });

    const location = properties.internalProperties.find(
      prop => prop.name === '[[FunctionLocation]]'
    );
    const script = this.scripts[location.value.value.scriptId];
    delete global[this.PREFIX][id];

    let source = decodeURI(script.url);
    if (!source.startsWith('file://')) {
      source = `file://${source}`;
    }

    return {
      column: location.value.value.columnNumber + 1,
      line: location.value.value.lineNumber + 1,
      path: source.substring(7),
      source,
    };
  }

  async clean() {
    if (this.session) {
      await this.port$('Runtime.releaseObjectGroup', {
        objectGroup: this.PREFIX,
      });
      this.session.disconnect();
    }

    this.session = null;
    this.port$ = null;
    this.scripts = null;
    delete global[this.PREFIX];
    LocationUtil.instance = null;
  }
}
LocationUtil.instance = null;
export default new LocationUtil();
