import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
    private readonly logger: Logger,
  ) {
    logger = new Logger('HTTP');
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, cookies, body } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const message = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;
      console.log(message);

      if (statusCode >= 500) {
        this.winstonLogger.error(message);
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        this.winstonLogger.warn(message);
        return this.logger.warn(message);
      }
      this.winstonLogger.log(message);

      return this.logger.log(message);
    });

    next();
  }
}
