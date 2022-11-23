import { MiddlewareConsumer, Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import baseConfig, { BaseConfigKey } from './common/config/baseConfig';
import databaseConfig from './common/config/databaseConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './common/logger/LoggerMiddleware';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { CustomWinstonLogger } from './common/logger/WinstonLogger';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user/user.module';
import { AllExceptionFilter } from './common/filter/exception.filter';
import { configTypes } from './common/config/configTypes';
import { MailModule } from './mail/mail.module';
import * as redisStore from 'cache-manager-redis-store';
import { MailerModule } from '@nestjs-modules/mailer';
import { TestModule } from './eng_test/test.module';
import { PartModule } from './part/part.module';
import { HistoryModule } from './history/history.module';
import { NoteModule } from './note/note.module';
import { TaskModule } from './task/task.module';
import mailerConfig from './common/config/mailerConfig';
import elasticSearchConfig from './common/config/elasticSearchConfig';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [baseConfig, databaseConfig, mailerConfig, elasticSearchConfig],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        ...configService.get(BaseConfigKey.REDIS),
      }),
    }),

    WinstonModule.forRoot(CustomWinstonLogger),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await configService.get(configTypes.DATABASE),
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

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = await configService.get(configTypes.MAILER);
        console.log(config);
        return config;
      },
    }),
    ScheduleModule.forRoot(),

    AuthModule,
    UserModule,
    MailModule,
    TestModule,
    PartModule,
    HistoryModule,
    NoteModule,
    TaskModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
