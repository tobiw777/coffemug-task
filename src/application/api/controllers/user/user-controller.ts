import { UserCreateDto } from '@application/api/controllers/user/dto/user-create-dto';
import { UserLoginDto } from '@application/api/controllers/user/dto/user-login-dto';
import { RefreshTokenDto } from '@application/api/controllers/user/dto/user-refresh-token-dto';
import { ExtendedUserResponseDto } from '@application/api/controllers/user/dto/user-response-dto';
import { GenerateRefreshTokenCommand } from '@application/commands/generate-refresh-token-command';
import { RefreshTokenCommand } from '@application/commands/refresh-token-command';
import { RegisterUserCommand } from '@application/commands/register-user-command';
import { RestError } from '@application/errors/http-error';
import { CommandQueryResult } from '@application/interfaces/query';
import { FindRefreshTokenQuery } from '@application/queries/find-refresh-token-query';
import { FindUserByEmailAndPasswordQuery } from '@application/queries/find-user-by-email-and-password-query';
import { CommandBus } from '@application/services/CommandBus';
import { QueryBus } from '@application/services/QueryBus';
import { IUser } from '@domain/entities/user';
import { JwtService } from '@infrastructure/services/jwt-service';
import { logger } from '@src/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Body, HttpCode, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@Service()
@JsonController()
export class UserController {
  public constructor(
    @Inject(() => CommandBus) private readonly commandBus: CommandBus,
    @Inject(() => QueryBus) private readonly queryBus: QueryBus,
    @Inject(() => JwtService) private readonly jwtService: JwtService,
  ) {}

  @HttpCode(201)
  @Post('/register')
  public async register(@Body() userDTO: UserCreateDto) {
    const _id = new Types.ObjectId();
    try {
      const commandResult = await this.commandBus.execute(RegisterUserCommand, {
        user: {
          _id,
          firstName: userDTO.first_name,
          lastName: userDTO.last_name,
          email: userDTO.email,
          password: userDTO.password,
          locality: userDTO.locality,
        },
      });

      if (commandResult.result !== CommandQueryResult.OK) {
        throw new RestError(commandResult.error!.statusCode, commandResult.error!.title, commandResult.error!.message);
      }

      const { jwtToken, refreshToken } = await this._generateTokens({
        _id,
        firstName: userDTO.first_name,
        lastName: userDTO.last_name,
        email: userDTO.email,
      });

      return new ExtendedUserResponseDto().hydrate(
        {
          _id,
          firstName: userDTO.first_name,
          lastName: userDTO.last_name,
          email: userDTO.email,
          locality: userDTO.locality,
        },
        jwtToken,
        refreshToken,
      );
    } catch (error) {
      logger.error(`An error occurred during user registration: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  @HttpCode(201)
  @Post('/login')
  public async login(@Body() userLoginDto: UserLoginDto) {
    const user = await this.queryBus.execute(FindUserByEmailAndPasswordQuery, userLoginDto);

    if (!user) {
      throw new RestError(StatusCodes.NOT_FOUND, 'Could not login with passed credentials');
    }

    const { refreshToken, jwtToken } = await this._generateTokens(user);

    return new ExtendedUserResponseDto().hydrate(user, jwtToken, refreshToken);
  }

  @HttpCode(201)
  @Post('/refresh_token')
  public async refreshToken(@Body() { refresh_token: refreshToken }: RefreshTokenDto) {
    const currentToken = await this.queryBus.execute(FindRefreshTokenQuery, {
      token: refreshToken,
    });

    if (!currentToken) {
      throw new RestError(StatusCodes.FORBIDDEN, 'Could not refresh token');
    }

    const refreshCommandResult = await this.commandBus.execute(RefreshTokenCommand, {
      currentToken: currentToken,
    });

    if (refreshCommandResult.result !== CommandQueryResult.OK) {
      throw new RestError(
        refreshCommandResult.error!.statusCode,
        refreshCommandResult.error!.title,
        refreshCommandResult.error!.message,
      );
    }

    const refreshedToken = await this.queryBus.execute(FindRefreshTokenQuery, {
      userId: currentToken.user._id,
    });

    if (!refreshedToken) {
      throw new RestError(StatusCodes.FAILED_DEPENDENCY, 'Could not get refresh token');
    }

    const { jwtToken } = await this._generateTokens(currentToken.user, true);

    return {
      jwt_token: jwtToken,
      refresh_token: refreshedToken.refreshToken,
    };
  }

  private async _generateTokens(
    userParams: Omit<IUser, 'password' | 'locality' | 'createdAt' | 'updatedAt'>,
    onlyJwt = false,
  ): Promise<{
    jwtToken: string;
    refreshToken: string;
  }> {
    let refreshToken = '';

    if (!onlyJwt) {
      const generateRefreshTokenResult = await this.commandBus.execute(GenerateRefreshTokenCommand, {
        user: {
          _id: userParams._id,
        },
      });

      if (generateRefreshTokenResult.result !== CommandQueryResult.OK) {
        throw new RestError(
          generateRefreshTokenResult.error!.statusCode,
          generateRefreshTokenResult.error!.title,
          generateRefreshTokenResult.error!.message,
        );
      }

      const refreshTokenEntity = await this.queryBus.execute(FindRefreshTokenQuery, {
        userId: userParams._id,
      });

      if (!refreshTokenEntity) {
        throw new RestError(StatusCodes.FAILED_DEPENDENCY, 'Could not get refresh token');
      }

      refreshToken = refreshTokenEntity.refreshToken;
    }
    const jwtToken = this.jwtService.sign({
      userId: userParams._id.toString(),
      email: userParams.email,
      firstName: userParams.firstName,
      lastName: userParams.lastName,
    });

    return {
      jwtToken,
      refreshToken,
    };
  }
}
