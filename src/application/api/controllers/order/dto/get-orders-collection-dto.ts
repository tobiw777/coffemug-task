import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class GetOrdersQueryDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  offset?: number;
}
