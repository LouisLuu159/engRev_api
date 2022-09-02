import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import baseConfig, { BaseConfigKey } from './config/baseConfig';
import databaseConfig from './config/databaseConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './logger/LoggerMiddleware';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { CustomWinstonLogger } from './logger/WinstonLogger';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [baseConfig, databaseConfig],
    }),

    WinstonModule.forRoot(CustomWinstonLogger),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await configService.get('database'),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        await configService.get(BaseConfigKey.RATE_LIMIT),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: configService.get(BaseConfigKey.REDIS),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UserModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
