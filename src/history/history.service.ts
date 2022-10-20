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
    const createdDetail = await this.historyDetailRepo.save(history.detail);
    history.detail = createdDetail;
    const createdHistory = await this.userHistoryRepo.save(history);
    return createdHistory;
  }

  async getHistory(userId: string, historyId: string) {
    const record = await this.userHistoryRepo.findOne({
      where: { id: historyId },
    });
    record.detail.answer_sheet = {};
    return record;
  }

  async getHistoryDetail(historyId: string) {
    const record = await this.userHistoryRepo.findOne({
      where: { id: historyId },
      join: {
        alias: 'user_history',
        leftJoinAndSelect: {
          detail: 'user_history.detail',
        },
      },
    });
    return record;
  }

  async listHistory(userId: string) {
    const records = await this.userHistoryRepo
      .createQueryBuilder('users_history')
      .leftJoinAndSelect('users_history.detail', 'history_detail')
      .where('users_history.userId = :userId', { userId })
      .select([
        'users_history.id',
        'users_history.score',
        'users_history.created_at',
        'users_history.testId',
        'users_history.userId',
      ])
      .addSelect([
        'history_detail.id',
        'history_detail.partScores',
        'history_detail.created_at',
      ])
      .getMany();

    return records;
  }
}
