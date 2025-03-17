import { buildOrder } from '../../src/utils/products';

describe('build-order', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const buildCartItem = () => {
    const cartItem = [
      {
        product_id: 'aabb',
        quantity: 3,
      },
    ];

    const mappedProductToOrder = {
      aabb: {
        stock: 10,
        price: 2.5,
      },
    };

    return {
      cartItem,
      mappedProductToOrder,
    };
  };
  it('should build order without any discounts', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 7.5,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 7 },
        },
      ],
    });
  });

  it('should build order without volume based discount', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    cartItem[0]!.quantity = 5;
    const order = buildOrder(cartItem, mappedProductToOrder);

    expect(order).toEqual({
      orderTotalPrice: 11.25,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 5 },
        },
      ],
    });
  });

  it('should apply black friday discount', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-11-28'));
    const order = buildOrder(cartItem, mappedProductToOrder);

    expect(order).toEqual({
      orderTotalPrice: 5.625,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 7 },
        },
      ],
    });
  });

  it('should apply bank holiday discount', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01'));
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 6.375,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 7 },
        },
      ],
    });
  });

  it('should prefer most valuable discount #1', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01'));
    cartItem[0]!.quantity = 5;
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 10.625,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 5 },
        },
      ],
    });
  });

  it('should prefer most valuable discount #2', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01'));
    cartItem[0]!.quantity = 10;
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 20,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 0 },
        },
      ],
    });
  });

  it('should prefer most valuable discount #3', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-11-28'));
    cartItem[0]!.quantity = 10;
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 18.75,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 0 },
        },
      ],
    });
  });

  it('should prefer most valuable discount #4', () => {
    const { cartItem, mappedProductToOrder } = buildCartItem();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-11-28'));
    cartItem[0]!.quantity = 50;
    mappedProductToOrder.aabb.stock = 60;
    const order = buildOrder(cartItem, mappedProductToOrder);
    expect(order).toEqual({
      orderTotalPrice: 87.5,
      productsToUpdate: [
        {
          filter: { _id: 'aabb' },
          update: { stock: 10 },
        },
      ],
    });
  });
});
