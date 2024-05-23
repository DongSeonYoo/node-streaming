import jwt from 'jsonwebtoken';
import env from '../config/env';
import { ITokenPayload } from '../interface/auth/ITokenPayload';

export namespace TokenManager {
  export const generate = (userInfo: ITokenPayload) => {
    const issuer = 'ecodot';

    return jwt.sign(userInfo, env.JWT_SECRET_KEY, {
      issuer,
    });
  };

  export const verify = (token: string): ITokenPayload | null => {
    try {
      const payload = <ITokenPayload>jwt.verify(token, env.JWT_SECRET_KEY);
      if (typeof payload === 'string') {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  };
}
