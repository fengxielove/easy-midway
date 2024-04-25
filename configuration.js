var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Configuration, App, Logger, Inject, MidwayWebRouterService, } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { DefaultErrorFilter } from './filter/default.filter.js';
// import { NotFoundFilter } from './filter/notfound.filter.js';
import DefaultConfig from './config/config.default.js';
import UnittestConfig from './config/config.unittest.js';
// 后增
import * as upload from '@midwayjs/upload';
import * as staticFile from '@midwayjs/static-file';
import { RequestMiddleware } from './middleware/request.middleware.js';
import { UserController } from './modules/user/controller/user.js';
import { AppModuleLoader } from './share/router.js';
export let MainConfiguration = class MainConfiguration {
    app;
    logger;
    webRouterService;
    async onReady() {
        const start = Date.now();
        // add middleware
        this.app.useMiddleware([RequestMiddleware]);
        // const routes = await this.webRouterService.getFlattenRouterTable();
        // this.logger.info('路由信息:', routes);
        // add filter
        new AppModuleLoader(this.app);
        // appModuleLoader.loadModules();
        this.webRouterService.addController(UserController, {
            prefix: '/test',
        });
        const eps = (await this.webRouterService.getFlattenRouterTable()).map(item => item.fullUrl);
        this.logger.info(eps);
        this.app.useFilter([DefaultErrorFilter]);
        this.logger.info('启动耗时 %d ms', Date.now() - start);
    }
};
__decorate([
    App('koa'),
    __metadata("design:type", Object)
], MainConfiguration.prototype, "app", void 0);
__decorate([
    Logger(),
    __metadata("design:type", Object)
], MainConfiguration.prototype, "logger", void 0);
__decorate([
    Inject(),
    __metadata("design:type", MidwayWebRouterService)
], MainConfiguration.prototype, "webRouterService", void 0);
MainConfiguration = __decorate([
    Configuration({
        imports: [
            koa,
            validate,
            upload,
            {
                component: info,
                enabledEnvironment: ['local'],
            },
            staticFile,
        ],
        importConfigs: [
            {
                default: DefaultConfig,
                unittest: UnittestConfig,
            },
        ],
    })
], MainConfiguration);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDTCxhQUFhLEVBQ2IsR0FBRyxFQUNILE1BQU0sRUFDTixNQUFNLEVBQ04sc0JBQXNCLEdBQ3ZCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxLQUFLLEdBQUcsTUFBTSxlQUFlLENBQUM7QUFDckMsT0FBTyxLQUFLLFFBQVEsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEtBQUssSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ2hFLGdFQUFnRTtBQUNoRSxPQUFPLGFBQWEsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLGNBQWMsTUFBTSw2QkFBNkIsQ0FBQztBQUV6RCxLQUFLO0FBQ0wsT0FBTyxLQUFLLE1BQU0sTUFBTSxrQkFBa0IsQ0FBQztBQUMzQyxPQUFPLEtBQUssVUFBVSxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUduRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFvQjdDLFdBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO0lBRTVCLEdBQUcsQ0FBa0I7SUFHckIsTUFBTSxDQUFVO0lBR2hCLGdCQUFnQixDQUF5QjtJQUV6QyxLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixpQkFBaUI7UUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFFNUMsc0VBQXNFO1FBQ3RFLHFDQUFxQztRQUNyQyxhQUFhO1FBRWIsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLGlDQUFpQztRQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRTtZQUNsRCxNQUFNLEVBQUUsT0FBTztTQUNoQixDQUFDLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQ25FLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDckIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUNGLENBQUE7QUE3QkM7SUFEQyxHQUFHLENBQUMsS0FBSyxDQUFDOzs4Q0FDVTtBQUdyQjtJQURDLE1BQU0sRUFBRTs7aURBQ087QUFHaEI7SUFEQyxNQUFNLEVBQUU7OEJBQ1Msc0JBQXNCOzJEQUFDO0FBUjlCLGlCQUFpQjtJQWxCN0IsYUFBYSxDQUFDO1FBQ2IsT0FBTyxFQUFFO1lBQ1AsR0FBRztZQUNILFFBQVE7WUFDUixNQUFNO1lBQ047Z0JBQ0UsU0FBUyxFQUFFLElBQUk7Z0JBQ2Ysa0JBQWtCLEVBQUUsQ0FBQyxPQUFPLENBQUM7YUFDOUI7WUFDRCxVQUFVO1NBQ1g7UUFDRCxhQUFhLEVBQUU7WUFDYjtnQkFDRSxPQUFPLEVBQUUsYUFBYTtnQkFDdEIsUUFBUSxFQUFFLGNBQWM7YUFDekI7U0FDRjtLQUNGLENBQUM7R0FDVyxpQkFBaUIsQ0ErQjdCIn0=