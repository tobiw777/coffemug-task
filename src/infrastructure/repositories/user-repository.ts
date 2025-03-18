import * as process from 'node:process';

import { IUser, TRegisterUserInput, UserModel } from '@domain/entities/user';
import { logger } from '@src/utils/logger';
import { compare, hash } from 'bcrypt';
import { Service } from 'typedi';

@Service()
export class UserRepository {
  public async findByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email }).exec();
    if (user) {
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }
    }
    return user;
  }

  public async createUser(user: TRegisterUserInput): Promise<IUser> {
    try {
      const passwordHash = await hash(user.password, Number(process.env.PASSWORD_SALT));
      return await UserModel.create({
        ...user,
        password: passwordHash,
      });
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }
}
