import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BullQueues } from 'src/common/constants/bullQueues';
import { EmailJobs, VerificationType } from './emailConstants';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(BullQueues.MAIL)
    private mailQueue: Queue,
  ) {}

  async sendAccountVerificationMail(email: string, otp: string): Promise<void> {
    await this.mailQueue.add(EmailJobs.VERIFICATION, {
      type: VerificationType.VERIFY_ACCOUNT,
      email: email,
      otp: otp,
    });
  }

  async sendResetPasswordMail(email: string, otp: string): Promise<void> {
    await this.mailQueue.add(EmailJobs.VERIFICATION, {
      type: VerificationType.RESET_PASSWORD,
      email: email,
      otp: otp,
    });
  }
}
