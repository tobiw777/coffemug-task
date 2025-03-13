import { RestError } from '@application/errors/http-error';
import { logger } from '@src/utils/logger';
import { BadRequestError, ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Middleware({
  type: 'after',
})
@Service()
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  public error(error: any, request: any, response: any, next: (err?: any) => any) {
    let errorToSend: RestError;
    if (error instanceof BadRequestError) {
      const errorDetails = (<any>error).errors || [];
      errorToSend = new RestError(error.httpCode, 'Invalid payload provided');
      errorToSend.errors = errorDetails.map(({ constraints = {} }) => constraints);
    } else if (error instanceof HttpError || error instanceof RestError) {
      errorToSend = error;
    } else {
      errorToSend = new RestError(500, 'An unknown error occurred.');
      logger.error(error);
    }
    response.statusCode = errorToSend.httpCode;
    response.json({
      status_code: errorToSend.httpCode,
      message: errorToSend.message,
      ...(errorToSend.detail && {
        detail: errorToSend.detail,
      }),
      ...(errorToSend.errors && {
        errors: errorToSend.errors,
      }),
    });
    next();
  }
}
