import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { plainToClass } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { BullQueues } from 'src/common/constants/bullQueues';
import { User } from 'src/user/entities/user.entity';
import { EmailJobs, EmailTemplates, VerificationType } from './emailConstants';

@Processor(BullQueues.MAIL)
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
    private readonly mailerService: MailerService,
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
    let aim = '';
    if (job.data.type == VerificationType.VERIFY_ACCOUNT) {
      subject += 'Please verify your account';
      aim = 'verify your email';
    } else {
      subject += 'Reset your password';
      aim = 'reset your password';
    }

    const result = await this.mailerService.sendMail({
      template: EmailTemplates.VERIFICATION,
      to: job.data.email,
      context: {
        name: name,
        otp: job.data.otp,
        aim: aim,
      },
      subject: subject,
    });

    return result;
  }
}
