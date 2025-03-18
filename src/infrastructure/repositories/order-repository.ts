import { ICreateOrderInput, IOrder, OrderModel } from '@domain/entities/order';
import { ProductModel } from '@domain/entities/product';
import { logger } from '@src/utils/logger';
import { IProductToUpdate } from '@src/utils/products';
import { Mongoose } from 'mongoose';
import { Container, Service } from 'typedi';

interface IFindByUserParams {
  userId: string;
  limit: number;
  offset?: number;
}

@Service()
export class OrderRepository {
  public async findOrdersByUserId({ userId, offset, limit }: IFindByUserParams): Promise<IOrder[]> {
    const query = OrderModel.find({
      user: userId,
    })
      .limit(limit)
      .populate('user');

    if (offset) {
      query.skip(offset);
    }

    return query.exec();
  }

  public async findOrderById(orderId: string): Promise<IOrder | null> {
    return OrderModel.findById(orderId).exec();
  }

  public async createOrderAndUpdateProducts(order: ICreateOrderInput, products: IProductToUpdate[]): Promise<void> {
    const dbClient = Container.get<Mongoose>('mongoose');
    const session = await dbClient.startSession();

    try {
      session.startTransaction();
      await ProductModel.bulkWrite(
        products.map((product) => ({
          updateOne: {
            ...product,
          },
        })),
      );
      await OrderModel.create(order);
      await session.commitTransaction();
    } catch (error) {
      logger.error(error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }
}
