import { randomUUID } from 'crypto';

import { IToken, TokenModel } from '@domain/entities/token';
import { IUser } from '@domain/entities/user';
import { Service } from 'typedi';

@Service()
export class TokenRepository {
  private readonly tokenTTL = Number(process.env.REFRESH_TOKEN_TTL ?? 300) * 1000;

  public async upsertToken(user: IUser): Promise<IToken> {
    const { refreshToken, ttl } = this._buildTokenAndTTL();
    const newToken = await TokenModel.findOneAndUpdate(
      {
        user: user._id,
      },
      {
        refreshToken,
        expiresAt: ttl,
      },
      {
        upsert: true,
      },
    )
      .populate('user')
      .exec();

    return newToken!;
  }

  public async findRefreshToken(refreshToken: string): Promise<IToken | null> {
    return TokenModel.findOne({ refreshToken });
  }

  public async updateToken(token: string): Promise<string> {
    const { refreshToken, ttl } = this._buildTokenAndTTL();
    await TokenModel.updateOne({ refreshToken: token }, { refreshToken, expiresAt: ttl });

    return refreshToken;
  }

  private _buildTokenAndTTL() {
    const refreshToken = randomUUID();
    const ttl = Date.now() + this.tokenTTL;

    return {
      ttl,
      refreshToken,
    };
  }
}
