import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  public refresh_token!: string;
}
