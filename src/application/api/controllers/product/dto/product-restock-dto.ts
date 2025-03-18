import { IsInt, IsPositive } from 'class-validator';

export class ProductRestockDto {
  @IsInt()
  @IsPositive()
  quantity!: number;
}
