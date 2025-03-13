import 'reflect-metadata';

import { httpLogger, logger } from '@src/utils/logger';
import mongoose from 'mongoose';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import 'dotenv/config';

import * as process from 'node:process';

import { ProductController } from '@application/api/controllers/product/dto/product-controller';
import { UserController } from '@application/api/controllers/user/user-controller';
import { ErrorMiddleware } from '@application/api/middlewares/error-middleware';

useContainer(Container);
(async () => {
  const mongooseInstance = await mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
      connectTimeoutMS: 10000,
    },
  );
  Container.set('mongoose', mongooseInstance);

  const app = createExpressServer({
    controllers: [UserController, ProductController],
    middlewares: [httpLogger, ErrorMiddleware],
    routePrefix: '/api',
    defaultErrorHandler: false,
  });
  app.disable('x-powered-by');
  const port = Number(process.env.PORT) || 3000;
  app.listen(port);
  logger.info(`Application started on port: ${port}`);
})()
  .then(() => null)
  .catch((error) => {
    logger.error(error);
    setTimeout(() => {
      logger.info('killing application');
      process.exit(1);
    });
  });
