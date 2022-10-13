import { MailerOptions } from '@nestjs-modules/mailer';
import { registerAs } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import Settings from '../../../settings.js';

export default registerAs(
  'mailer',
  (): MailerOptions => ({
    transport: {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    },
    defaults: {
      from: process.env.EMAIL_ID,
    },
    template: {
      dir: Settings.PROJECT_DIR + '/src/mail/templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
);
