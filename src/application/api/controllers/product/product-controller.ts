// import { ProductCreateDto } from '@application/api/controllers/product/dto/product-create-dto';
import { ProductResponseDto } from '@application/api/controllers/product/dto/product-response-dto';
import { AuthMiddleware } from '@application/api/middlewares/auth-middleware';
import { RestError } from '@application/errors/http-error';
import { FindProductQuery } from '@application/queries/find-product-query';
import { QueryBus } from '@application/services/QueryBus';
import { REGEX_BSON_ID } from '@src/utils/constants';
import { StatusCodes } from 'http-status-codes';
// import { Types } from 'mongoose';
import { Get, JsonController, Param, UseBefore } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@JsonController('/products')
@Service()
export class ProductController {
  constructor(@Inject(() => QueryBus) private readonly queryBus: QueryBus) {}

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
  //
  // public async addProduct(@Body() product: ProductCreateDto) {
  //   const _id = new Types.ObjectId();
  // }
}
