import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { TRegisterUserInput } from '@domain/entities/user';
import { UserRepository } from '@infrastructure/repositories/user-repository';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface IRegisterUserCommandParams {
  user: TRegisterUserInput;
}

@Command()
@Service()
export class RegisterUserCommand implements CommandInterface<IRegisterUserCommandParams> {
  public constructor(@Inject(() => UserRepository) private readonly userRepository: UserRepository) {}

  public async handle({ user }: IRegisterUserCommandParams): Promise<ICommandQueryResult> {
    try {
      const existingUser = await this.userRepository.findByEmailAndPassword(user.email, user.password);
      if (existingUser) {
        return {
          result: CommandQueryResult.FAILED,
          error: {
            message: `User: ${user.email} already exists`,
            title: 'Could not register user',
            statusCode: StatusCodes.FORBIDDEN,
          },
        };
      }

      await this.userRepository.createUser(user);

      return {
        result: CommandQueryResult.OK,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error while registering user';

      return {
        result: CommandQueryResult.FAILED,
        error: {
          title: 'Could not register user',
          message,
          statusCode: StatusCodes.FORBIDDEN,
        },
      };
    }
  }
}
