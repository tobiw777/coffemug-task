import * as process from 'node:process';

import { IUserToken } from '@domain/interfaces/jwt-token';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { Service } from 'typedi';

@Service()
export class JwtService {
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly jwtExpires = process.env.JWT_EXPIRE_TIME;

  public verify(token: string): IUserToken {
    return <IUserToken>jwt.verify(token, this.jwtSecret!);
  }

  public sign(data: IUserToken): string {
    return jwt.sign(data, this.jwtSecret!, {
      expiresIn: this.jwtExpires! as StringValue,
    });
  }
}
