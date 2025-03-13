import { RestError } from '@application/errors/http-error';
import { IExtendedRequest } from '@application/interfaces/request';
import { JwtService } from '@infrastructure/services/jwt-service';
import { logger } from '@src/utils/logger';
import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@Service()
@Middleware({
  type: 'before',
})
export class AuthMiddleware implements ExpressMiddlewareInterface {
  constructor(@Inject(() => JwtService) protected readonly jwtService: JwtService) {}
  public use(request: IExtendedRequest, response: Response, next: NextFunction) {
    const token = this.getTokenFromHeader(request);
    if (!token) {
      logger.error('No token provided');
      throw new RestError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
    try {
      const authToken = this.jwtService.verify(token);

      request.identity = {
        id: authToken.userId,
      };

      next();
    } catch (error) {
      logger.error(error);
      throw new RestError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
  }

  private getTokenFromHeader(request: IExtendedRequest): string | undefined {
    const [type, accessToken] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? accessToken : undefined;
  }
}
