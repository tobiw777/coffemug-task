import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IToken } from '@domain/entities/token';
import { TokenRepository } from '@infrastructure/repositories/token-repository';
import { Types } from 'mongoose';
import { Inject, Service } from 'typedi';

interface IFindRefreshTokenQueryParams {
  token?: string;
  userId?: Types.ObjectId;
}

@Query()
@Service()
export class FindRefreshTokenQuery implements QueryInterface<IFindRefreshTokenQueryParams, IToken | null> {
  public constructor(@Inject(() => TokenRepository) private readonly tokenRepository: TokenRepository) {}

  public async handle(params: IFindRefreshTokenQueryParams): Promise<IToken | null> {
    if (!params.token && !params.userId) {
      throw Error('Invalid params provided');
    }

    return this.tokenRepository.findRefreshToken(params);
  }
}
