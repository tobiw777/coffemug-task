import { registerDecorator } from 'class-validator';

export const IsDistinctProductsArray = () => (object: object, propertyName: string) =>
  registerDecorator({
    async: false,
    name: 'IsDistinctProductsArray',
    target: object.constructor,
    propertyName,
    constraints: [],
    validator: {
      validate(value: { product_id: string; quantity: number }[] = []): boolean {
        const productsSet = new Set(value.map(({ product_id }) => product_id));

        return productsSet.size === value.length;
      },
      defaultMessage: () => 'Product categories must be unique',
    },
  });
