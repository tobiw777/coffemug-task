import { IProduct } from '@domain/entities/product';
import { LOCALITY } from '@domain/entities/user';
import { BLACK_FRIDAY_DATE, POLISH_BANK_HOLIDAYS, priceLocalityFactor } from '@src/utils/constants';

export interface IMappedProductToOrder {
  [key: string]: {
    stock: number;
    price: number;
  };
}

export interface ICartItem {
  product_id: string;
  quantity: number;
}

export interface IProductToUpdate {
  filter: { _id: string };
  update: { stock: number };
}

export interface IReducedProductData {
  products: IProductToUpdate[];
  totalItemsCount: number;
  baseTotalPrice: number;
  eachProductsTotalCost: number[];
}

export interface IOrderWithProducts {
  orderTotalPrice: number;
  productsToUpdate: IProductToUpdate[];
}

export const convertPrice = <T>(numPrice: number, toString = false): T => {
  if (toString) {
    return numPrice.toFixed(2) as T;
  }

  return parseFloat(numPrice.toFixed(2)) as T;
};

export const mapProductsArrayToOrderObject = (products: IProduct[], buyerLocality: LOCALITY): IMappedProductToOrder =>
  products.reduce((acc: IMappedProductToOrder, currentProduct) => {
    acc[currentProduct._id.toString()] = {
      stock: currentProduct.stock,
      price: convertPrice<number>(Number(currentProduct.price)) * priceLocalityFactor[buyerLocality],
    };

    return acc;
  }, {});

export const validateProductsStock = (productsToBuy: ICartItem[], mappedProductOrder: IMappedProductToOrder) =>
  productsToBuy.every(({ product_id: productId, quantity }) => mappedProductOrder[productId]!.stock >= quantity);

export const dateToMonthString = (date: Date) => date.toISOString().slice(5, 10);

export const isBlackFriday = (date: Date) => dateToMonthString(date) === BLACK_FRIDAY_DATE;

export const isPolishBankHoliday = (date: Date) => !!POLISH_BANK_HOLIDAYS[dateToMonthString(date)];

export const calculateQuantityDiscountFactor = (itemsCount: number) => {
  if (itemsCount < 5) return 1;
  if (itemsCount >= 5 && itemsCount < 10) return 0.9;
  if (itemsCount >= 10 && itemsCount < 50) return 0.8;
  if (itemsCount >= 50) return 0.7;
};

export const buildOrder = (
  productsToBuy: ICartItem[],
  mappedProductOrder: IMappedProductToOrder,
): IOrderWithProducts => {
  const now = new Date();
  const isBlackFridayDiscountPossible = isBlackFriday(now);
  const isBankHolidayDiscountPossible = isPolishBankHoliday(now);

  const reducedProductOrder: IReducedProductData = productsToBuy.reduce(
    (acc: IReducedProductData, currentCartItem: ICartItem) => {
      const currentItemCost = mappedProductOrder[currentCartItem.product_id]!.price * currentCartItem.quantity;
      const newProductQuantity = mappedProductOrder[currentCartItem.product_id]!.stock - currentCartItem.quantity;

      acc.totalItemsCount = acc.totalItemsCount + currentCartItem.quantity; // add products from cart
      acc.baseTotalPrice = acc.baseTotalPrice + currentItemCost; // sum costs of current product
      acc.eachProductsTotalCost.push(currentItemCost);
      acc.products.push({
        filter: { _id: currentCartItem.product_id },
        update: { stock: newProductQuantity },
      });

      return acc;
    },
    {
      totalItemsCount: 0,
      baseTotalPrice: 0,
      eachProductsTotalCost: [],
      products: [],
    },
  );

  const mostExpensiveProducts = reducedProductOrder.eachProductsTotalCost.toSorted((a, b) => b - a).slice(0, 2);

  let holidayDiscountedPrice = reducedProductOrder.baseTotalPrice;

  if (!isBlackFridayDiscountPossible && isBankHolidayDiscountPossible) {
    mostExpensiveProducts.forEach((item) => {
      const discountedItem = item * 0.85;
      holidayDiscountedPrice -= item;
      holidayDiscountedPrice += discountedItem;
    });
  }

  const volumeBasedDiscountedPrice =
    reducedProductOrder.baseTotalPrice * calculateQuantityDiscountFactor(reducedProductOrder.totalItemsCount)!;

  const blackFridayDiscountedPrice = isBlackFridayDiscountPossible
    ? reducedProductOrder.baseTotalPrice * 0.75
    : reducedProductOrder.baseTotalPrice;
  const finalPrice = [volumeBasedDiscountedPrice, blackFridayDiscountedPrice, holidayDiscountedPrice].toSorted()[0]!;

  return {
    orderTotalPrice: finalPrice,
    productsToUpdate: reducedProductOrder.products,
  };
};
