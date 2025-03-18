import { IUser } from '@domain/entities/user';
import { model, Schema } from 'mongoose';

export interface IToken {
  _id: string;
  refreshToken: string;
  user: IUser;
  expiresAt: Date;
}

export const TokenModel = model<IToken>(
  'Token',
  new Schema({
    refreshToken: {
      type: String,
      unique: true,
    },
    expiresAt: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }),
);
