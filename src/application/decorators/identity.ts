import { createParamDecorator } from 'routing-controllers';

export const Identity = () =>
  createParamDecorator({
    value: (action) => action.request.identity,
  });
