import { model, Schema, Types } from 'mongoose';

export enum LOCALITY {
  ASIA = 'ASIA',
  EUROPE = 'EUROPE',
  US = 'US',
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  locality: LOCALITY;
  createdAt: Date;
  updatedAt: Date;
}

export type TRegisterUserInput = Omit<IUser, 'createdAt' | 'updatedAt'>;

export const UserModel = model<IUser>(
  'User',
  new Schema({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      required: true,
      enum: [LOCALITY.EUROPE, LOCALITY.US, LOCALITY.ASIA],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  }),
);
