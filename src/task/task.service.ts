import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly userService: UserService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 0 0 * * *')
  async handleTimeout() {
    const users = await this.userService.getUsersForReminder();

    const scheduleDict: { [time_reminder: string]: User[] } = {};
    users.forEach((user) => {
      if (scheduleDict[user.config.time_reminder])
        scheduleDict[user.config.time_reminder].push(user);
      else scheduleDict[user.config.time_reminder] = [user];
    });

    Object.keys(scheduleDict).map((time_reminder) => {
      const [hour, minute] = time_reminder.split(':');
      const date = new Date();
      date.setHours(Number(hour));
      date.setMinutes(Number(minute));

      console.log('setCronJob: ', time_reminder, date);

      const job = new CronJob(date, () => {
        Promise.all(
          scheduleDict[time_reminder].map(async (user) => {
            await this.mailService.sendReminderMail(user.email);
          }),
        );
      });
      this.schedulerRegistry.addCronJob(`${Date.now()}-sendReminderMail`, job);
      job.start();
    });
  }
}
