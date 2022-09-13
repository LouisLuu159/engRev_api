import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { plainToClass } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { BaseConfigKey } from 'src/common/config/baseConfig';
import { BullQueues } from 'src/common/constants/bullQueues';
import { User } from 'src/user/entities/user.entity';
import { EmailJobs, EmailTemplates, VerificationType } from './emailConstants';

@Processor(BullQueues.MAIL)
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(EmailJobs.VERIFICATION)
  async sendVerificationMail(
    job: Job<{ type: VerificationType; email: string; otp: string }>,
  ): Promise<any> {
    const logMessage = `Sending announcement email to '${job.data.email}'`;
    console.log(logMessage);
    this.logger.debug(logMessage);
    this.winstonLogger.debug(logMessage);

    const name = job.data.email.split('@')[0];
    let subject = '[EngRev] ';
    let template;

    let context: any = { name: name };
    if (job.data.type == VerificationType.ACTIVATE) {
      subject += 'Activate your account';
      template = EmailTemplates.ACTIVATION;
      context.otp = job.data.otp;
    } else {
      subject += 'Reset your password';
      template = EmailTemplates.RESET_PASSWORD;
      let user_web_url = await this.configService.get(
        BaseConfigKey.USER_WEB_URL,
      );
      console.log(user_web_url);
      context.reset_link = `${user_web_url}/reset-password/${job.data.otp}`;
    }

    const result = await this.mailerService.sendMail({
      template: template,
      to: job.data.email,
      context: context,
      subject: subject,
    });

    return result;
  }
}
