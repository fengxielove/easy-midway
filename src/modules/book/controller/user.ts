import {
  BaseController,
  EasyController,
  EasyTag,
  EasyUrlTag,
  TagTypes,
} from '@/core/index.js';
import { UserEntity } from '../entity/user.entity.js';
import { Post } from '@midwayjs/core';

@EasyController({
  prefix: '/book_user',
  api: ['info', 'delete', 'list', 'page'],
  entity: UserEntity,
})
@EasyUrlTag({
  key: TagTypes.IGNORE_TOKEN,
})
export class BookUser extends BaseController {
  @EasyTag(TagTypes.IGNORE_TOKEN)
  @Post('/add')
  async add() {
    return this.ok('add');
  }
}
