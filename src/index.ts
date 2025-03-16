import 'reflect-metadata';

import { httpLogger, logger } from '@src/utils/logger';
import mongoose, { Mongoose } from 'mongoose';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import 'dotenv/config';

import * as process from 'node:process';

import { ErrorMiddleware } from '@application/api/middlewares/error-middleware';
import Redis from 'ioredis';

useContainer(Container);
(async () => {
  const mongooseInstance: Mongoose = await mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
      connectTimeoutMS: 10000,
      replicaSet: 'RS',
    },
  );

  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT!,
  });

  Container.set('redis', redisClient);
  Container.set('mongoose', mongooseInstance);

  const [{ OrderController }, { ProductController }, { UserController }] = await Promise.all([
    import('@application/api/controllers/order/order-controller.js'),
    import('@application/api/controllers/product/product-controller.js'),
    import('@application/api/controllers/user/user-controller.js'),
  ]);

  const app = createExpressServer({
    controllers: [UserController, ProductController, OrderController],
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
