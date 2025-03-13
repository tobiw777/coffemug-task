import { IProduct, ProductModel } from '@domain/entities/product';
import { UserModel } from '@domain/entities/user';
import { logger } from '@src/utils/logger';
import { Service } from 'typedi';

@Service()
export class ProductRepository {
  public async findProductById(id: string): Promise<IProduct | null> {
    return UserModel.findById(id);
  }

  public async createProduct(product: IProduct): Promise<IProduct> {
    try {
      return await ProductModel.create(product);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
}
