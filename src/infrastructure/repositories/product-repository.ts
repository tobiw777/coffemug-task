import { IProduct, ProductModel } from '@domain/entities/product';
import { logger } from '@src/utils/logger';
import { Service } from 'typedi';

@Service()
export class ProductRepository {
  public async findProductById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id);
  }

  public async createProduct(product: IProduct): Promise<IProduct> {
    try {
      return await ProductModel.create(product);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  public async updateProduct(product: IProduct): Promise<IProduct> {
    try {
      await ProductModel.updateOne(
        {
          _id: product._id,
        },
        {
          stock: product.stock,
          name: product.name,
          price: product.price,
          description: product.description,
        },
      ).exec();

      return product;
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }

  public async findProductsCollection({
    name,
    limit,
    offset,
    ids,
  }: {
    name?: string;
    limit: number;
    offset?: number;
    ids?: string[];
  }): Promise<IProduct[]> {
    const query = ProductModel.find().limit(limit).sort({ _id: 'asc' });
    if (name) {
      query.where({
        name: {
          $regex: `.*${name}.*`,
          $options: 'i',
        },
      });
    }
    if (ids?.length) {
      query.where({
        _id: {
          $in: ids,
        },
      });
    }
    if (offset) {
      query.skip(offset);
    }

    return query.exec();
  }
}
