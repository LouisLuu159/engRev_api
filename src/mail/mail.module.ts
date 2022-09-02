import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configTypes } from 'src/common/config/configTypes';
import { BullQueues } from 'src/common/constants/bullQueues';
import { MailService } from './mail.service';

@Module({
  imports: [
   
    BullModule.registerQueue({
      name: BullQueues.MAIL,
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
