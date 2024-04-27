import { EasyController } from '@/core/decorator/controller.js';
import { UserEntity } from '../entity/user.entity.js';
import { BaseController } from '@/core/controller/baseController.js';

@EasyController({
  prefix: '/user',
  api: ['add', 'info', 'page', 'list', 'update', 'delete'],
  entity: UserEntity,
})
export class UserController extends BaseController {}
