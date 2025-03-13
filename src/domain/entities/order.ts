import { IUser } from '@domain/entities/user';
import { model, Schema, Types } from 'mongoose';

export enum PAYMENT_STATUS {
  NOT_PAID = 'NOT_PAID',
  PAID = 'PAID',
}

export enum SHIPMENT_STATUS {
  NOT_SHIPPED = 'NOT_SHIPPED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
}

export interface IOrder {
  _id: Types.ObjectId;
  totalPrice: Schema.Types.Decimal128;
  shipmentStatus: SHIPMENT_STATUS;
  paymentStatus: PAYMENT_STATUS;
  user: IUser;
}

export const OrderModel = model<IOrder>(
  'OrderModel',
  new Schema({
    totalPrice: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    shipmentStatus: {
      type: String,
      required: true,
      enum: [SHIPMENT_STATUS.RECEIVED, SHIPMENT_STATUS.NOT_SHIPPED, SHIPMENT_STATUS.SHIPPED],
      default: SHIPMENT_STATUS.NOT_SHIPPED,
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.NOT_PAID, PAYMENT_STATUS.PAID],
      required: true,
      default: PAYMENT_STATUS.NOT_PAID,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }),
);
