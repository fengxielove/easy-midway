import { MiddlewareParamArray } from '@midwayjs/core';

export interface JoinOp {
  entity: any;
  alias: string;
  condition: string;
  type?: 'innerJoin' | 'leftJoin';
}
export interface FieldEq {
  column: string;
  requestParam: string;
}
export interface QueryOp {
  keyWordLikeFields?: string[];
  where?: Function;
  select?: string[];
  fieldEq?: string[] | FieldEq[] | (string | FieldEq)[];
  addOrderBy?: {};
  join?: JoinOp[];
  extend?: Function;
}

export type ApiTypes = 'add' | 'delete' | 'update' | 'page' | 'info' | 'list';
export interface CurdOption {
  prefix?: string;
  api: ApiTypes[];
  pageQueryOp?: QueryOp | Function;
  listQueryOp?: QueryOp | Function;
  insertParam?: Function;
  before?: Function;
  infoIgnoreProperty?: string[];
  entity: any;
  service?: any;
  urlTag?: {
    name: 'ignoreToken' | string;
    url: ApiTypes[];
  };
}

export interface RouterOptions {
  sensitive?: boolean;
  middleware?: MiddlewareParamArray;
  description?: string;
  tagName?: string;
  ignoreGlobalPrefix?: boolean;
}
