import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { IToken } from '@domain/entities/token';
import { TokenRepository } from '@infrastructure/repositories/token-repository';
import { logger } from '@src/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface IRefreshCommandParams {
  currentToken: IToken;
}

@Command()
@Service()
export class RefreshTokenCommand implements CommandInterface<IRefreshCommandParams> {
  constructor(@Inject(() => TokenRepository) private readonly tokenRepository: TokenRepository) {}

  public async handle({ currentToken }: IRefreshCommandParams): Promise<ICommandQueryResult> {
    if (currentToken.expiresAt.getTime() < Date.now()) {
      logger.info('Refresh token expired');

      return {
        result: CommandQueryResult.FAILED,
        error: {
          statusCode: StatusCodes.FORBIDDEN,
          title: 'Forbidden',
          message: 'Could not refresh token',
        },
      };
    }
    try {
      await this.tokenRepository.updateToken(currentToken.refreshToken);
    } catch (error) {
      logger.error(`Could not refresh token ${JSON.stringify(error)}`);

      const errorMessage = error instanceof Error ? error.message : 'Could not refresh token';

      return {
        result: CommandQueryResult.FAILED,
        error: {
          error,
          statusCode: StatusCodes.FORBIDDEN,
          title: 'Forbidden',
          message: errorMessage,
        },
      };
    }

    return {
      result: CommandQueryResult.OK,
    };
  }
}
