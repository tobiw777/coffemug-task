import { randomUUID } from 'crypto';

import pino from 'pino';
import { pinoHttp } from 'pino-http';

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
});

const httpLogger = pinoHttp({
  logger,
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    reqId: 'requestId',
  },
  messageKey: 'message',
  errorKey: 'error',
  quietReqLogger: true,
  genReqId: () => randomUUID(),
  customLogLevel: (req, res, error) =>
    error || res.statusCode >= 500
      ? 'error'
      : req.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
        ? 'info'
        : 'debug',
  customSuccessMessage: (req, res) =>
    !req.readableAborted && res.writableEnded ? 'Request succeeded' : 'Request aborted',
  customErrorMessage: () => 'Request failed',
  redact: ['request.headers.authorization'],
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    request: (req) => ({
      ...req,
      url: req.url.split('?').shift(),
      body: JSON.stringify(req.raw.body),
    }),
    response: (res) => ({
      ...res,
      body: res.raw ? JSON.stringify(res.raw.body) : undefined,
    }),
  },
});

export { logger, httpLogger };
