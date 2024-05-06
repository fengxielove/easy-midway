import { BaseService, EasyCommException } from '@/core/index.js';
import { Inject, InjectClient, Provide } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserEntity } from '@/modules/book/entity/user.entity.js';
import { Context } from '@midwayjs/koa';
import { LoginDTO } from '@/modules/base/dto/login.js';
import { Repository } from 'typeorm';
import { JwtService } from '@midwayjs/jwt';

@Provide()
export class BaseSysLoginService extends BaseService {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  jwtService: JwtService;

  @InjectEntityModel(UserEntity)
  baseSysBookUserEntity: Repository<UserEntity>;

  @Inject()
  ctx: Context;

  async login(login: LoginDTO) {
    const { username, password } = login;
    const user = await this.baseSysBookUserEntity.findOneBy({
      username,
    });
    //   校验用户
    if (user) {
      if (user.password !== password) {
        throw new EasyCommException('账户或密码不正确~');
      }
    }

    //   生成 token
    //   const {expire, refreshExpire} = this
    console.log('ssss', await this.generateToken(user));
    const result = {
      token: await this.generateToken(user),
    };

    //   将用户相关信息保存到缓存中
    await this.midwayCache.set(`admin:token:${user.id}`, result.token);
    return result;
  }

  async generateToken(user: UserEntity) {
    await this.midwayCache.set(
      `admin:passwordVersion: ${user.id}`,
      user.password
    );

    const tokenInfo = {
      username: user.username,
      userId: user.id,
    };

    return this.jwtService.signSync(tokenInfo, 'fengxie', { expiresIn: '1d' });
  }
}
