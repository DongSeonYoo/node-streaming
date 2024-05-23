import env from '../config/env';
import controller from '../util/controller';
import { ForbiddenException, UnauthorizedException } from 'jochong-exception';
import { RequestHandler } from 'express';
import { Role } from '../interface/user/IRole';
import { TokenManager } from '../util/token';
import { redisService } from '../service';

/**
 * 로그인 + 권한 체크 미들웨어
 * @param role 체크할 권한 (optional)
 * @param options 인증 옵션 (optional)
 * @returns
 */
export const loginAuthGuard = (role?: Role, options?: { only: boolean }): RequestHandler => {
  return controller(async (req, res, next) => {
    const token: string | undefined = req.cookies[env.COOKIE_NAME];
    if (!token) {
      console.log('토큰이 존재하지 않을 경우');
      throw new UnauthorizedException('토큰이 존재하지 않습니다');
    }

    // 토큰이 조작되거나 올바르지 않은 경우
    const payload = TokenManager.verify(token);
    if (!payload) {
      console.log('토큰이 조작되거나 올바르지 않은 경우');
      res.clearCookie(env.COOKIE_NAME);
      throw new UnauthorizedException('로그인 후 이용가능합니다');
    }

    if (typeof role !== 'undefined') {
      // 옵션이 존재하는 경우
      if (options?.only) {
        if (payload.role !== role) {
          throw new ForbiddenException('권한이 존재하지 않습니다');
        }
      }

      // 매개변수로 넘어온 직급보다 낮은 경우
      if (role < payload.role) {
        throw new ForbiddenException('권한이 존재하지 않습니다');
      }
    }

    // 세션저장소에 로그인한 유저가 존재하지 않는 경우
    const findLoggedInUser = await redisService.client.get(`session:${payload.idx}`);
    if (!findLoggedInUser) {
      console.log('세션저장소에 로그인한 유저가 존재하지 않는 경우');
      throw new UnauthorizedException('로그인 후 이용가능합니다');
    }

    // update TTL
    await redisService.client.expire(`session:${payload.idx}`, env.LOGIN_TTL);

    req.user = {
      ...payload,
    };

    return next();
  });
};
