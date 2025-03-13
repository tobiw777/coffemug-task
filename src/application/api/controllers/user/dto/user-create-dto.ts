import { LOCALITY } from '@domain/entities/user';
import { IsEmail, IsIn, IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsIn([LOCALITY.ASIA, LOCALITY.EUROPE, LOCALITY.US])
  locality!: LOCALITY;
}
