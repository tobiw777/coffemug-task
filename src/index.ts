import 'reflect-metadata';

import { httpLogger, logger } from '@src/utils/logger';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import 'dotenv/config';

import * as process from 'node:process';

useContainer(Container);
(async () => {
  const app = createExpressServer({
    controllers: [],
    middlewares: [httpLogger],
    routePrefix: '/api',
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
