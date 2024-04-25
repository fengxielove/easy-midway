import { MidwayWebRouterService } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { ILogger } from '@midwayjs/logger';
export declare class MainConfiguration {
    app: koa.Application;
    logger: ILogger;
    webRouterService: MidwayWebRouterService;
    onReady(): Promise<void>;
}
