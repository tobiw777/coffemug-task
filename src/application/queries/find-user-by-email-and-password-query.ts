import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IUser } from '@domain/entities/user';
import { UserRepository } from '@infrastructure/repositories/user-repository';
import { Inject, Service } from 'typedi';

interface ILoginQueryParams {
  email: string;
  password: string;
}

@Query()
@Service()
export class FindUserByEmailAndPasswordQuery implements QueryInterface<ILoginQueryParams, IUser | null> {
  constructor(@Inject(() => UserRepository) private readonly userRepository: UserRepository) {}

  public async handle({ email, password }: ILoginQueryParams): Promise<IUser | null> {
    return this.userRepository.findByEmailAndPassword(email, password);
  }
}
