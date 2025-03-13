import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { IUser } from '@domain/entities/user';
import { TokenRepository } from '@infrastructure/repositories/token-repository';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface IGenerateRefreshTokenCommandParams {
  user: Pick<IUser, '_id'>;
}

@Command()
@Service()
export class GenerateRefreshTokenCommand implements CommandInterface<IGenerateRefreshTokenCommandParams> {
  public constructor(@Inject(() => TokenRepository) private readonly tokenRepository: TokenRepository) {}

  public async handle({ user }: IGenerateRefreshTokenCommandParams): Promise<ICommandQueryResult> {
    try {
      await this.tokenRepository.upsertToken(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error while generating refresh token';

      return {
        result: CommandQueryResult.FAILED,
        error: {
          title: 'Could create refresh token',
          message,
          statusCode: StatusCodes.FAILED_DEPENDENCY,
        },
      };
    }

    return {
      result: CommandQueryResult.OK,
    };
  }
}
