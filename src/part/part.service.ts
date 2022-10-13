import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import e from 'express';
import { Collection } from 'src/eng_test/entities/collection.entity';
import { Part } from 'src/eng_test/entities/part.entity';
import { QuestionDictionary } from 'src/eng_test/interfaces/question.interface';
import { Repository } from 'typeorm';
import { GetPartQueryDto } from './dto/query.dto';

@Injectable()
export class PartService {
  constructor(@InjectRepository(Part) private partRepo: Repository<Part>) {}

  async getPart(partId: string, query: GetPartQueryDto = {}) {
    const { answerInclude, questionInclude, transcriptInclude } = query;
    const part = await this.partRepo.findOne({
      where: { id: partId },
      join: {
        alias: 'part',
        leftJoinAndSelect: {
          collection: 'part.collections',
        },
      },
    });

    if (!part) throw new BadRequestException('partId is not exist');

    part.collections = part.collections.map((collection) => {
      let collectionData: Collection = collection;
      console.log(transcriptInclude);
      if (!transcriptInclude) collectionData.transcript = null;

      let questionData = {};
      Object.keys(collectionData.questions).forEach((key) => {
        const question = collectionData.questions[key];
        if (!answerInclude) question.answer = null;
        questionData[key] = question;
      });

      if (!questionInclude && !answerInclude) collectionData.questions = null;
      else collectionData.questions = questionData;

      return collectionData;
    });

    return part;
  }
}
