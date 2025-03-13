import { IsInt, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class ProductCreateDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  @MaxLength(50)
  description!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsInt()
  @IsPositive()
  stock!: number;
}
