import { Request } from 'express';

export interface IExtendedRequest extends Request {
  identity: {
    id: string;
  };
}
