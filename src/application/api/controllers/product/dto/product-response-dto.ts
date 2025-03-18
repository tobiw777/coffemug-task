import { IProduct } from '@domain/entities/product';
import { convertPrice } from '@src/utils/products';

export class ProductResponseDto {
  id!: string;
  name!: string;
  description!: string;
  price!: number;
  stock!: number;

  public hydrate(product: IProduct) {
    this.id = product._id.toString();
    this.name = product.name;
    this.description = product.description;
    this.price = convertPrice(Number(product.price));
    this.stock = product.stock;

    return this;
  }
}
