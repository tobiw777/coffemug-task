import { IUser } from '@domain/entities/user';

export class UserResponseDto {
  id!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  locality!: string;

  public hydrate(user: IUser) {
    this.id = user._id.toString();
    this.email = user.email;
    this.first_name = user.firstName;
    this.last_name = user.lastName;
    this.locality = user.locality;

    return this;
  }
}

export class ExtendedUserResponseDto {
  id!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  jwt_token!: string;
  refresh_token!: string;
  locality!: string;

  public hydrate(user: Omit<IUser, 'password' | 'updatedAt' | 'createdAt'>, jwtToken: string, refreshToken: string) {
    this.id = user._id.toString();
    this.email = user.email;
    this.first_name = user.firstName;
    this.last_name = user.lastName;
    this.locality = user.locality;
    this.jwt_token = jwtToken;
    this.refresh_token = refreshToken;

    return this;
  }
}
