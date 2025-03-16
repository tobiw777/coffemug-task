import { ProductCreateDto } from '@application/api/controllers/product/dto/product-create-dto';
import { ProductResponseDto } from '@application/api/controllers/product/dto/product-response-dto';
import { ProductRestockDto } from '@application/api/controllers/product/dto/product-restock-dto';
import { ProductsCollectionDto } from '@application/api/controllers/product/dto/products-collection-dto';
import { AuthMiddleware } from '@application/api/middlewares/auth-middleware';
import { CreateProductCommand } from '@application/commands/create-product-command';
import { UpdateProductQuantityCommand } from '@application/commands/update-product-quantity-command';
import { Lock } from '@application/decorators/lock';
import { RestError } from '@application/errors/http-error';
import { CommandQueryResult } from '@application/interfaces/query';
import { FindProductQuery } from '@application/queries/find-product-query';
import { ProductsCollectionQuery } from '@application/queries/find-products-collection-query';
import { CommandBus } from '@application/services/CommandBus';
import { QueryBus } from '@application/services/QueryBus';
import { REGEX_BSON_ID } from '@src/utils/constants';
import { logger } from '@src/utils/logger';
import { convertPrice } from '@src/utils/products';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Body, Get, HttpCode, JsonController, Param, Post, QueryParams, UseBefore } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@JsonController('/products')
@Service()
export class ProductController {
  public constructor(
    @Inject(() => QueryBus) private readonly queryBus: QueryBus,
    @Inject(() => CommandBus) private readonly commandBus: CommandBus,
  ) {}

  @UseBefore(AuthMiddleware)
  @Get(`/:id(${REGEX_BSON_ID})`)
  public async getProduct(@Param('id') id: string) {
    const product = await this.queryBus.execute(FindProductQuery, {
      id,
    });

    if (!product) {
      throw new RestError(StatusCodes.NOT_FOUND, 'Not Found', 'Product not found');
    }

    return new ProductResponseDto().hydrate(product);
  }

  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  @Post('')
  public async addProduct(@Body() productDto: ProductCreateDto) {
    const _id = new Types.ObjectId();
    const validPrice = convertPrice<string>(productDto.price, true);

    try {
      const addProductResult = await this.commandBus.execute(CreateProductCommand, {
        product: {
          _id,
          stock: productDto.stock,
          name: productDto.name,
          description: productDto.description,
          price: validPrice as any,
        },
      });

      if (addProductResult.result !== CommandQueryResult.OK) {
        throw new RestError(
          addProductResult.error!.statusCode,
          addProductResult.error!.title,
          addProductResult.error!.message,
        );
      }

      const productFromDB = await this.queryBus.execute(FindProductQuery, {
        id: _id.toString(),
      });

      if (!productFromDB) {
        throw new RestError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          'Unprocessable Content',
          'Could not fetch new product from DB',
        );
      }

      return new ProductResponseDto().hydrate(productFromDB);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  @Post('/:id/restock')
  @Lock((...[id]) => [id])
  public async restockProduct(@Param('id') id: string, @Body() { quantity }: ProductRestockDto) {
    try {
      const product = await this.queryBus.execute(FindProductQuery, {
        id,
      });

      if (!product) {
        throw new RestError(StatusCodes.NOT_FOUND, 'Not Found', 'Product not found');
      }

      const newQuantity = product.stock + quantity;

      const updateQuantityCommandResult = await this.commandBus.execute(UpdateProductQuantityCommand, {
        newQuantity,
        product,
      });

      if (updateQuantityCommandResult.result !== CommandQueryResult.OK) {
        throw new RestError(
          updateQuantityCommandResult.error!.statusCode,
          updateQuantityCommandResult.error!.title,
          updateQuantityCommandResult.error!.message,
        );
      }

      return new ProductResponseDto().hydrate(product);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
  @HttpCode(201)
  @UseBefore(AuthMiddleware)
  @Post('/:id/sell')
  @Lock((...[id]) => [id])
  public async sellProduct(@Param('id') id: string, @Body() { quantity }: ProductRestockDto) {
    try {
      const product = await this.queryBus.execute(FindProductQuery, {
        id,
      });

      if (!product) {
        throw new RestError(StatusCodes.NOT_FOUND, 'Not Found', 'Product not found');
      }

      const newQuantity = product.stock - quantity;

      if (newQuantity < 0) {
        throw new RestError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          'Unprocessable Content',
          'Could not sell more products than current stock',
        );
      }

      const updateQuantityCommandResult = await this.commandBus.execute(UpdateProductQuantityCommand, {
        newQuantity,
        product,
      });

      if (updateQuantityCommandResult.result !== CommandQueryResult.OK) {
        throw new RestError(
          updateQuantityCommandResult.error!.statusCode,
          updateQuantityCommandResult.error!.title,
          updateQuantityCommandResult.error!.message,
        );
      }

      return new ProductResponseDto().hydrate(product);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  @Get()
  public async getProductsCollection(@QueryParams() params: ProductsCollectionDto) {
    const { limit = 20, offset = 0, name } = params;
    const products = await this.queryBus.execute(ProductsCollectionQuery, {
      limit: limit + 1, // one more to lazy check if we have next page
      offset,
      name,
    });

    const hasNextPage = products.length > limit;
    const collectionResult = products.slice(0, limit).map((product) => new ProductResponseDto().hydrate(product));

    return {
      products: collectionResult,
      hasNextPage,
    };
  }
}
