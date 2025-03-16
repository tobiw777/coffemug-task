import { Command } from '@application/decorators/command';
import { CommandInterface } from '@application/interfaces/command';
import { CommandQueryResult, ICommandQueryResult } from '@application/interfaces/query';
import { ICreateOrderInput } from '@domain/entities/order';
import { OrderRepository } from '@infrastructure/repositories/order-repository';
import { IProductToUpdate } from '@src/utils/products';
import { StatusCodes } from 'http-status-codes';
import { Inject, Service } from 'typedi';

interface ICreateOrderCommandParams {
  order: ICreateOrderInput;
  productsToUpdate: IProductToUpdate[];
}

@Command()
@Service()
export class CreateOrderCommand implements CommandInterface<ICreateOrderCommandParams> {
  public constructor(@Inject(() => OrderRepository) private orderRepository: OrderRepository) {}

  public async handle({ order, productsToUpdate }: ICreateOrderCommandParams): Promise<ICommandQueryResult> {
    try {
      await this.orderRepository.createOrderAndUpdateProducts(order, productsToUpdate);

      return {
        result: CommandQueryResult.OK,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error while creating order';

      return {
        result: CommandQueryResult.FAILED,
        error: {
          title: 'Could create order',
          message,
          statusCode: StatusCodes.FAILED_DEPENDENCY,
        },
      };
    }
  }
}
