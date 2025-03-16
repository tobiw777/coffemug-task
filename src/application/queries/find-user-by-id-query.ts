import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IUser } from '@domain/entities/user';
import { UserRepository } from '@infrastructure/repositories/user-repository';
import { Inject, Service } from 'typedi';

interface IUserByIdParams {
  id: string;
}

@Query()
@Service()
export class FindUserByIdQuery implements QueryInterface<IUserByIdParams, IUser | null> {
  public constructor(@Inject(() => UserRepository) private userRepository: UserRepository) {}

  public async handle({ id }: IUserByIdParams): Promise<IUser | null> {
    return this.userRepository.findUserById(id);
  }
}
