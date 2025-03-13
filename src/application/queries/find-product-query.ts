import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IProduct } from '@domain/entities/product';
import { ProductRepository } from '@infrastructure/repositories/product-repository';
import { Inject, Service } from 'typedi';

interface IFindProductParams {
  id: string;
}

@Query()
@Service()
export class FindProductQuery implements QueryInterface<IFindProductParams, IProduct | null> {
  public constructor(@Inject(() => ProductRepository) private productRepository: ProductRepository) {}

  public async handle({ id }: IFindProductParams): Promise<IProduct | null> {
    return this.productRepository.findProductById(id);
  }
}
