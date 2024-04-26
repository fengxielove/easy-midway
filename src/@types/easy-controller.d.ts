import { MiddlewareParamArray } from '@midwayjs/decorator';
export type ApiTypes = 'add' | 'delete' | 'update' | 'page' | 'info' | 'list';
export interface CurdOption {
  controllerPath?: string;
  prefix?: string;
  api: ApiTypes[];
  pageQueryOp?: QueryOp | (() => void);
  listQueryOp?: QueryOp | (() => void);
  insertParam?: () => void;
  before?: () => void;
  infoIgnoreProperty?: string[];
  entity?: any;
  service?: any;
  urlTag?: {
    name: 'ignoreToken' | string;
    url: ApiTypes[];
  };
  dto?: any;
}

export interface RouterOptions {
  sensitive?: boolean;
  middleware?: MiddlewareParamArray;
  description?: string;
  tagName?: string;
  ignoreGlobalPrefix?: boolean;
}
