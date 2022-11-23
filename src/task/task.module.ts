import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { TaskService } from './task.service';

@Module({
  imports: [UserModule, MailModule],
  providers: [TaskService],
})
export class TaskModule {}
