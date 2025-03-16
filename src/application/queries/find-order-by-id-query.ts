import { Query } from '@application/decorators/query';
import { QueryInterface } from '@application/interfaces/query';
import { IOrder } from '@domain/entities/order';
import { OrderRepository } from '@infrastructure/repositories/order-repository';
import { Inject, Service } from 'typedi';

interface IParams {
  orderId: string;
}

@Query()
@Service()
export class FindOrderById implements QueryInterface<IParams, IOrder | null> {
  public constructor(@Inject(() => OrderRepository) private orderRepository: OrderRepository) {}

  public async handle({ orderId }: IParams): Promise<IOrder | null> {
    return this.orderRepository.findOrderById(orderId);
  }
}
