import { IsDistinctProductsArray } from '@application/decorators/distinct-products';
import { LOCALITY } from '@domain/entities/user';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderProduct {
  @IsString()
  product_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsDefined()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderProduct)
  @IsDistinctProductsArray()
  products!: OrderProduct[];

  @IsOptional()
  @IsString()
  @IsIn([LOCALITY.US, LOCALITY.EUROPE, LOCALITY.ASIA])
  locality?: LOCALITY;
}
