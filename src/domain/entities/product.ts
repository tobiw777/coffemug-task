import { model, Schema } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: Schema.Types.Decimal128;
  stock: number;
}

export const ProductModel = model<IProduct>(
  'Product',
  new Schema({
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    description: {
      type: String,
      required: true,
      maxLength: 50,
    },
    price: {
      required: true,
      type: Schema.Types.Decimal128,
    },
    stock: {
      required: true,
      type: Number,
    },
  }),
);
