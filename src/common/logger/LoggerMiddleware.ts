import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, cookies, body } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const message = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;
      const messageObj = {
        method: method,
        originalUrl: originalUrl,
        statusCode: statusCode,
        contentLength: contentLength,
        userAgent: userAgent,
        ip: ip,
      };

      if (statusCode >= 500) {
        this.winstonLogger.error(messageObj);
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        this.winstonLogger.warn(messageObj);
        return this.logger.warn(message);
      }
      this.winstonLogger.debug(messageObj);
      return this.logger.log(message);
    });

    next();
  }
}
