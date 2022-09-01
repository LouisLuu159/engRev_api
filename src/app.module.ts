import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import baseConfig from './config/baseConfig';
import databaseConfig from './config/databaseConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './logger/LoggerMiddleware';
import { WinstonModule } from 'nest-winston';

const winston = require('winston');

const transports = {
  combinedFile: new winston.transports.File({
    filename:
      'logs/Combined_' +
      new Date(Date.now()).toISOString().split('T')[0] +
      '.log',
    level: 'info',
    handleExceptions: true,
  }),
  errorFile: new winston.transports.File({
    filename:
      'logs/Errors_' +
      new Date(Date.now()).toISOString().split('T')[0] +
      '.log',
    level: 'error',
  }),
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [baseConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await configService.get('database'),
      inject: [ConfigService],
    }),

    WinstonModule.forRoot({
      transports: [transports.combinedFile, transports.errorFile],
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
