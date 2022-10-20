import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHistory } from './entities/history.entity';
import { HistoryDetail } from './entities/historyDetail.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(UserHistory)
    private userHistoryRepo: Repository<UserHistory>,
    @InjectRepository(HistoryDetail)
    private historyDetailRepo: Repository<HistoryDetail>,
  ) {}

  async saveHistory(history: UserHistory) {
    const createdHistory = await this.userHistoryRepo.save(history);
    return createdHistory;
  }
}
