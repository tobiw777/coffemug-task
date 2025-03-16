import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IProduct } from '@domain/entities/product';
import { ProductRepository } from '@infrastructure/repositories/product-repository';
import { Inject, Service } from 'typedi';

interface ICollectionQueryParams {
  offset?: number;
  limit: number;
  name?: string;
  ids?: string[];
}

@Query()
@Service()
export class ProductsCollectionQuery implements QueryInterface<ICollectionQueryParams, IProduct[]> {
  public constructor(@Inject(() => ProductRepository) private productRepository: ProductRepository) {}

  public async handle(params: ICollectionQueryParams): Promise<IProduct[]> {
    return this.productRepository.findProductsCollection(params);
  }
}
