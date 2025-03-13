import * as process from 'node:process';

import { IUser, UserModel } from '@domain/entities/user';
import { logger } from '@src/utils/logger';
import { compare, hash } from 'bcrypt';
import { Service } from 'typedi';

@Service()
export class UserRepository {
  public async findByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ where: { email } }).exec();
    if (user) {
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }
    }
    return user;
  }

  public async createUser(user: IUser): Promise<IUser> {
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
}
