import { CreateOrderDto } from '@application/api/controllers/order/dto/create-order-dto';
import { GetOrdersQueryDto } from '@application/api/controllers/order/dto/get-orders-collection-dto';
import { OrderResponseDto } from '@application/api/controllers/order/dto/order-response-dto';
import { AuthMiddleware } from '@application/api/middlewares/auth-middleware';
import { CreateOrderCommand } from '@application/commands/create-order-command';
import { Identity } from '@application/decorators/identity';
import { Lock } from '@application/decorators/lock';
import { RestError } from '@application/errors/http-error';
import { CommandQueryResult } from '@application/interfaces/query';
import { FindOrderById } from '@application/queries/find-order-by-id-query';
import { ProductsCollectionQuery } from '@application/queries/find-products-collection-query';
import { FindUserByIdQuery } from '@application/queries/find-user-by-id-query';
import { FindUserOrderQuery } from '@application/queries/find-user-orders-query';
import { CommandBus } from '@application/services/CommandBus';
import { QueryBus } from '@application/services/QueryBus';
import { logger } from '@src/utils/logger';
import { buildOrder, convertPrice, mapProductsArrayToOrderObject, validateProductsStock } from '@src/utils/products';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Body, Get, HttpCode, JsonController, Post, QueryParams, UseBefore } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@JsonController('/orders')
@Service()
export class OrderController {
  public constructor(
    @Inject(() => QueryBus) private readonly queryBus: QueryBus,
    @Inject(() => CommandBus) private readonly commandBus: CommandBus,
  ) {}

  @UseBefore(AuthMiddleware)
  @Get('/')
  public async getOrders(
    @Identity() { userId }: { userId: string },
    @QueryParams() { offset = 0, limit = 20 }: GetOrdersQueryDto,
  ) {
    const userOrders = await this.queryBus.execute(FindUserOrderQuery, {
      offset,
      limit: limit + 1,
      userId,
    });
    const hasNextPage = userOrders.length > limit;
    const collectionResult = userOrders.slice(0, limit).map((userOrder) => new OrderResponseDto().hydrate(userOrder));

    return {
      orders: collectionResult,
      hasNextPage,
    };
  }

  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  @Post('/')
  @Lock((...[, { products }]) => products.map(({ product_id }: { product_id: string }) => product_id))
  public async makeOrder(@Identity() { userId }: { userId: string }, @Body() createOrderDto: CreateOrderDto) {
    const user = await this.queryBus.execute(FindUserByIdQuery, { id: userId });

    if (!user) {
      throw new RestError(StatusCodes.NOT_FOUND, 'Not Found', `User with id: ${userId} not found`);
    }

    try {
      const productsToBuy = await this.queryBus.execute(ProductsCollectionQuery, {
        limit: createOrderDto.products.length,
        ids: createOrderDto.products.map(({ product_id }) => product_id),
      });

      if (!productsToBuy.length) {
        throw new RestError(StatusCodes.NOT_FOUND, 'Not Found', 'Products from cart are not available');
      }

      const localityToUse = createOrderDto.locality ?? user.locality;
      const mappedProductsToOrder = mapProductsArrayToOrderObject(productsToBuy, localityToUse);

      if (!validateProductsStock(createOrderDto.products, mappedProductsToOrder)) {
        throw new RestError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          'Unprocessable Content',
          'Could not buy more products than its stock size',
        );
      }

      const _id = new Types.ObjectId();

      const { orderTotalPrice, productsToUpdate } = buildOrder(createOrderDto.products, mappedProductsToOrder);
      const convertedPrice = convertPrice<string>(orderTotalPrice, true);

      const newOrder = {
        _id,
        totalPrice: convertedPrice as any,
        user: {
          _id: userId,
        },
      };
      const createOrderCommandResult = await this.commandBus.execute(CreateOrderCommand, {
        order: newOrder,
        productsToUpdate,
      });

      if (createOrderCommandResult.result !== CommandQueryResult.OK) {
        const { statusCode, title, message } = createOrderCommandResult.error!;
        throw new RestError(statusCode, title, message);
      }

      const orderFromDb = await this.queryBus.execute(FindOrderById, {
        orderId: _id.toString(),
      });

      if (!orderFromDb) {
        throw new RestError(StatusCodes.FAILED_DEPENDENCY, 'Could not get order from DB');
      }

      return new OrderResponseDto().hydrate(orderFromDb);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
}
