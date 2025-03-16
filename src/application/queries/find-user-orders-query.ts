import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IOrder } from '@domain/entities/order';
import { OrderRepository } from '@infrastructure/repositories/order-repository';
import { Inject, Service } from 'typedi';

interface IUserOrdersParams {
  userId: string;
  limit: number;
  offset?: number;
}

@Query()
@Service()
export class FindUserOrderQuery implements QueryInterface<IUserOrdersParams, IOrder[]> {
  public constructor(@Inject(() => OrderRepository) private orderRepository: OrderRepository) {}

  public async handle(params: IUserOrdersParams): Promise<IOrder[]> {
    return this.orderRepository.findOrdersByUserId(params);
  }
}
