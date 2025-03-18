import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { IProduct } from '@domain/entities/product';
import { ProductRepository } from '@infrastructure/repositories/product-repository';
import { logger } from '@src/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface IUpdateProductQuantityParams {
  product: IProduct;
  newQuantity: number;
}

@Command()
@Service()
export class UpdateProductQuantityCommand implements CommandInterface<IUpdateProductQuantityParams> {
  public constructor(@Inject(() => ProductRepository) private readonly productRepository: ProductRepository) {}

  public async handle(params: IUpdateProductQuantityParams): Promise<ICommandQueryResult> {
    params.product.stock = params.newQuantity;
    try {
      await this.productRepository.updateProduct(params.product);

      return {
        result: CommandQueryResult.OK,
      };
    } catch (e) {
      logger.error(e);

      return {
        result: CommandQueryResult.FAILED,
        error: {
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          title: 'Unprocessible Content',
          message: 'Could not update product quantity',
        },
      };
    }
  }
}
