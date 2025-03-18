import { Request } from 'express';

export interface IExtendedRequest extends Request {
  identity: {
    userId: string;
  };
}
