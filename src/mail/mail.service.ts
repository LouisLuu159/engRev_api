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

  async sendVerificationMail(
    type: VerificationType,
    email: string,
    otp: string,
  ): Promise<void> {
    await this.mailQueue.add(EmailJobs.VERIFICATION, {
      type: type,
      email: email,
      otp: otp,
    });
  }
}
