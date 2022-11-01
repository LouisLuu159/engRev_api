import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTestQueryDto } from 'src/eng_test/dto/query.dto';
import { Skills, TestType } from 'src/eng_test/test.constant';
import { Repository } from 'typeorm';
import { UserHistory } from './entities/history.entity';
import { HistoryDetail } from './entities/historyDetail.entity';
import { PartScores } from './interface/history.interface';

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

  async listHistory(userId: string, testQuery?: GetTestQueryDto) {
    const historyQuery = this.userHistoryRepo
      .createQueryBuilder('users_history')
      .select([
        'users_history.id',
        'users_history.score',
        'users_history.created_at',
        'users_history.testId',
        'users_history.userId',
      ])
      .orderBy('users_history.created_at', 'DESC')
      .where('users_history.userId = :userId', { userId });

    let records: UserHistory[];

    if (testQuery) {
      historyQuery.leftJoin('users_history.test', 'test');
      const { testType, skill, partType } = testQuery;

      if (testType === TestType.FULL_TEST) {
        historyQuery.andWhere('test.type = :type', { type: testType });
      }
      ///
      else if (testType === TestType.SKILL_TEST && skill) {
        historyQuery.andWhere('test.type = :type', { type: testType });
        historyQuery.andWhere('test.skills = :skill', { skill });
      }
      ///
      else if (testType === TestType.PART_TRAIN && partType) {
        historyQuery.andWhere('test.partType = :partType', { partType });
      }

      records = await historyQuery.getMany();
      let tests: { [testId: string]: UserHistory } = {};
      records.forEach((history) => {
        if (!Boolean(tests[history.testId])) tests[history.testId] = history;
      });
      records = Object.values(tests);
    }

    ///
    else {
      historyQuery
        .leftJoin('users_history.detail', 'history_detail')
        .addSelect([
          'history_detail.id',
          'history_detail.partScores',
          'history_detail.created_at',
        ]);
      records = await historyQuery.getMany();
    }

    return records;
  }

  async getLatestTestResult(userId: string, skill: Skills) {
    const record = await this.userHistoryRepo
      .createQueryBuilder('users_history')
      .leftJoinAndSelect('users_history.detail', 'history_detail')
      .leftJoinAndSelect('users_history.test', 'test')
      .leftJoinAndSelect('test.parts', 'part')
      .where('test.type = :type1', { type1: TestType.FULL_TEST })
      .orWhere('test.type = :type2', { type2: TestType.SKILL_TEST })
      .andWhere('part.skill = :skill', { skill })
      .orderBy('users_history.created_at', 'DESC')
      .select([
        'users_history.id',
        'users_history.score',
        'history_detail.partScores',
      ])
      .limit(1)
      .getOne();

    if (!Boolean(record)) return null;

    let score = 0;
    Object.values(record.detail.partScores).forEach((partScore) => {
      if (partScore.skill === skill) score += partScore.score;
    });

    let result: {
      score: number;
      skill: Skills;
      id: string;
    } = null;
    if (record)
      result = {
        score: score,
        skill: skill,
        id: record.id,
      };
    return result;
  }
}
