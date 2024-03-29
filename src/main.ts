import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { warn } from 'console';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfigKey } from './common/config/baseConfig';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const static_path = join(__dirname, '..', '../public');
  console.log('path: ', static_path);
  console.log('exist: ', fs.existsSync(static_path));
  app.use('/public', express.static(static_path));

  // app.setGlobalPrefix('v1');
  const whitelist = process.env.WHITE_LIST.split(',');

  // console.log(whitelist);

  if (whitelist.length > 0) {
    app.enableCors({
      origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          console.log('Allowed cors for:', origin);
          callback(null, true);
        } else {
          console.log('blocked cors for:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      allowedHeaders:
        'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range',
      methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
      credentials: true,
      exposedHeaders: ['SET-COOKIE'],
    });
  }

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('EngRev API')
    .setDescription('EngRev API')
    .setVersion('1.0')
    .addTag('API')
    .addCookieAuth('Authentication', { type: 'http', in: 'Header', scheme: '' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1', app, document);

  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get(BaseConfigKey.PORT);
  await app.listen(PORT);
  warn(`APP IS LISTENING TO PORT ${PORT}`);
}
bootstrap();
