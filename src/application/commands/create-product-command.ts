import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { IProduct } from '@domain/entities/product';
import { ProductRepository } from '@infrastructure/repositories/product-repository';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface ICreateProductInputParams {
  product: IProduct;
}

@Command()
@Service()
export class CreateProductCommand implements CommandInterface<ICreateProductInputParams> {
  public constructor(@Inject(() => ProductRepository) private readonly productRepository: ProductRepository) {}

  public async handle({ product }: ICreateProductInputParams): Promise<ICommandQueryResult> {
    try {
      await this.productRepository.createProduct(product);

      return {
        result: CommandQueryResult.OK,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during product creation';

      return {
        result: CommandQueryResult.FAILED,
        error: {
          error: e,
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          title: 'Uprocessable Content',
          message,
        },
      };
    }
  }
}
