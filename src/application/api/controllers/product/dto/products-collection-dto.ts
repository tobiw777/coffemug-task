import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class ProductsCollectionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  offset?: number;

  @IsOptional()
  @IsString()
  name?: string;
}
