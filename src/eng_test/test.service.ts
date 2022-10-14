import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createInterface } from 'node:readline';
import { Readable } from 'stream';
import { once } from 'node:events';
import { TranscriptDictionary } from './interfaces/transcript.interface';
import { Question, QuestionDictionary } from './interfaces/question.interface';
import { Collection } from './entities/collection.entity';
import { TestType, parts, Skills, PartType } from './test.constant';
import { Test } from './entities/test.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindCondition, Repository } from 'typeorm';
import { Part } from './entities/part.entity';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepo: Repository<Collection>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(Part) private partRepo: Repository<Part>,
  ) {}
  async getAnswerDict(answerKeyFile: Express.Multer.File, range: number[]) {
    const rl = createInterface({
      input: Readable.from(answerKeyFile.buffer),
      crlfDelay: Infinity,
    });

    let answersDictionary = {};
    rl.on('line', (line) => {
      line = line.trim();
      if (Boolean(parseInt(line.charAt(0), 10))) {
        const firstPointIndex = line.indexOf('.');
        const answerNo = Number(line.substring(0, firstPointIndex).trim());
        const answer = line.substring(firstPointIndex + 1).trim();
        answersDictionary[answerNo.toString()] = answer;
      }
    });
    await once(rl, 'close');

    for (let i = range[0]; i <= range[1]; i++) {
      if (!Boolean(answersDictionary[i.toString()])) {
        throw new BadRequestException(
          `answerKeyFile doesn't have answer question No ${i} `,
        );
      }
    }
    return answersDictionary;
  }

  async getTranscriptDict(
    transcriptFile: Express.Multer.File,
  ): Promise<TranscriptDictionary> {
    const rl = createInterface({
      input: Readable.from(transcriptFile.buffer),
      crlfDelay: Infinity,
    });

    let transcriptDict: TranscriptDictionary = {};
    let currentTransId = '';
    let currentPartId = '';
    let currentTranscript = '';

    rl.on('line', (line) => {
      line = line.trim();

      if (line) {
        if (Boolean(parseInt(line.charAt(0), 10))) {
          const firstPointIndex = line.indexOf('.');
          const transId = line.substring(0, firstPointIndex).trim();

          const transNo = Number(transId.split('-')[0]);
          let partId = '';

          if (transNo <= 6) partId = '1'; //Part 1
          else if (transNo >= 7 && transNo <= 31) partId = '2'; //Part 2
          else if (transNo >= 32 && transNo <= 70) partId = '3'; //Part 3
          else partId = '4'; //Part 4

          currentPartId = partId;
          currentTransId = transId;
          currentTranscript = ''; // Reset current transcript
        } else {
          const transcriptLine = line.replace('+', '').trim();
          currentTranscript += ' ';

          if (currentPartId == '1' || currentPartId == '2') {
            // Part1 or Part 2
            currentTranscript += `<p>${transcriptLine}</p>`;
          } else {
            // Part3 or Part 4
            if (line.charAt(0) === '+') {
              currentTranscript += `<p>${transcriptLine}</p>`;
            } else {
              const lastEndTagIndex = currentTranscript.lastIndexOf('</p>');
              const new_content = ' ' + transcriptLine + '</p>';
              currentTranscript =
                currentTranscript.substring(0, lastEndTagIndex) + new_content;
            }
          }
        }
        transcriptDict[currentTransId] = currentTranscript;
      }
    });

    await once(rl, 'close');
    return transcriptDict;
  }

  async getCollections(
    file: Express.Multer.File,
    answerDict: object,
    transcriptDict: TranscriptDictionary,
    range: number[],
  ): Promise<Collection[]> {
    let questionDict: QuestionDictionary = {};
    let currentQuestionNo = 0;
    let collectionsRange = [];

    const part1Range = [parts.PART1.range_start, parts.PART1.range_end];
    const part2Range = [parts.PART2.range_start, parts.PART2.range_end];

    if (JSON.stringify(range) === JSON.stringify(part1Range)) {
      file = null;
      for (let i = part1Range[0]; i <= part1Range[1]; i++) {
        const key = `${i}`;
        const questionData: Question = {
          questionNo: key,
          content: '',
          answer: '',
          options: {},
        };
        questionDict[key] = questionData;
      }
      collectionsRange.push(part1Range[0] + '-' + part1Range[1]);
    }

    if (JSON.stringify(range) === JSON.stringify(part2Range)) {
      file = null;
      for (let i = part2Range[0]; i <= part2Range[1]; i++) {
        const key = `${i}`;
        const questionData: Question = {
          questionNo: key,
          content: '',
          answer: '',
          options: {},
        };
        questionDict[key] = questionData;
      }
      collectionsRange.push(part2Range[0] + '-' + part2Range[1]);
    }

    if (range[1] >= 100 && range[0] < 100) {
      for (let i = part1Range[0]; i <= part2Range[1]; i++) {
        const key = `${i}`;
        const questionData: Question = {
          questionNo: key,
          content: '',
          answer: '',
          options: {},
        };
        questionDict[key] = questionData;
      }
      collectionsRange.push(part1Range[0] + '-' + part1Range[1]);
      collectionsRange.push(part2Range[0] + '-' + part2Range[1]);
    }

    if (file) {
      const rl = createInterface({
        input: Readable.from(file.buffer),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        line = line.trim();

        if (line.charAt(0) === '*') {
          const range = line.split('*')[1].trim();
          collectionsRange.push(range);
        } else if (Boolean(parseInt(line.charAt(0), 10))) {
          const firstPointIndex = line.indexOf('.');
          const questionNo = Number(line.substring(0, firstPointIndex).trim());
          const questionCont = line.substring(firstPointIndex + 1).trim();

          currentQuestionNo = questionNo;
          const questionData: Question = {
            questionNo: questionNo.toString(),
            content: questionCont,
            answer: '',
            options: {},
          };
          questionDict[questionNo.toString()] = questionData;
        } else if (line.charAt(0) === '(') {
          const optionLetter = line.charAt(1);
          const optionCont = line.split(')')[1].trim();
          questionDict[currentQuestionNo.toString()].options[optionLetter] =
            optionCont;
        } else {
          questionDict[currentQuestionNo.toString()].content += line;
        }
      });

      await once(rl, 'close');
    }

    if (range[0] >= 101 && range[0] < 200 && collectionsRange.length === 0) {
      throw new BadRequestException(
        `questionFile doesn't contain collection range`,
      );
    }

    for (let i = range[0]; i <= range[1]; i++) {
      if (i >= 1 && i <= 31) continue;

      if (!Boolean(questionDict[i.toString()])) {
        throw new BadRequestException(
          `questionFile doesn't contain question No ${i}`,
        );
      }
    }

    let collections: Collection[] = [];
    collectionsRange.forEach((range) => {
      const range_start = Number(range.split('-')[0]);
      const range_end = Number(range.split('-')[1]);
      const collection: Collection = {
        range_start: range_start,
        range_end: range_end,
        images: [],
        transcript: {},
        questions: {},
      };
      collections.push(collection);
    });

    Object.values(questionDict).forEach((questionData: Question) => {
      const questionNo = Number(questionData.questionNo);
      const collectionIndex = collections.findIndex(
        (collection) =>
          questionNo >= collection.range_start &&
          questionNo <= collection.range_end,
      );

      collections[collectionIndex].questions[questionNo] = {
        ...questionData,
        answer: answerDict[questionNo.toString()],
      };
    });

    if (transcriptDict) {
      Object.keys(transcriptDict).forEach((key) => {
        const number = Number(key.split('-')[0]);
        const collectionIndex = collections.findIndex(
          (collection) =>
            number >= collection.range_start && number <= collection.range_end,
        );
        collections[collectionIndex].transcript[key] = transcriptDict[key];
      });
    }
    return collections;
  }

  async createTest(test: Test) {
    const new_test = await this.testRepo.save(test);
    let creating_parts = test.parts;
    creating_parts = creating_parts.map((part) => {
      return { ...part, testId: new_test.id };
    });

    const creating_collections: Collection[] = [];

    const insert_promises = creating_parts.map(async (part) => {
      const new_part = await this.partRepo.save(part);
      part.collections.forEach((collection) => {
        const new_collection = { ...collection, partId: new_part.id };
        creating_collections.push(new_collection);
      });
    });

    await Promise.all(insert_promises);
    await this.collectionRepo
      .createQueryBuilder()
      .insert()
      .into(Collection)
      .values(creating_collections)
      .execute();
    return { message: 'Create Test Successfully' };
  }

  async getWholeTest(testId: string, skill: Skills) {
    let test: Test;
    if (skill) {
      const result = await this.testRepo
        .createQueryBuilder('test')
        .leftJoinAndSelect('test.parts', 'part')
        .leftJoinAndSelect('part.collections', 'collection')
        .where('test.id = :testId', { testId })
        .andWhere('part.skill = :skill', { skill })
        .getMany();
      test = result[0];
    } else {
      const result = await this.testRepo
        .createQueryBuilder('test')
        .leftJoinAndSelect('test.parts', 'part')
        .leftJoinAndSelect('part.collections', 'collection')
        .where('test.id = :testId', { testId })
        .getMany();
      test = result[0];
    }

    if (!Boolean(test)) throw new NotFoundException(ResponseErrors.NOT_FOUND);

    const filtered_test = test;
    filtered_test.parts = test.parts.map((part) => {
      part.collections = part.collections.map((collection) => {
        const { transcript, ...filtered_collection } = collection;
        const filtered_questions = {};
        Object.keys(collection.questions).forEach((key) => {
          const { answer, ...filtered_question } = collection.questions[key];
          filtered_questions[key] = filtered_question;
        });
        filtered_collection.questions = filtered_questions;
        return filtered_collection;
      });
      return part;
    });
    return filtered_test;
  }

  async deleteTest(testId: string) {
    await this.testRepo.delete({ id: testId });
    return { message: 'Delete Test Successfully' };
  }

  async getTest(testId) {
    const test = await this.testRepo.findOne({
      where: { id: testId },
      join: {
        alias: 'test',
        leftJoinAndSelect: {
          part: 'test.parts',
        },
      },
    });
    if (!test) throw new NotFoundException(ResponseErrors.NOT_FOUND);
    return test;
  }

  async getAnswer(testId: string) {
    const collections = await this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoin('collection.part', 'part')
      .leftJoin('part.test', 'test')
      .where('test.id = :testId', { testId })
      .select('collection.questions')
      .getMany();

    if (collections.length == 0)
      throw new NotFoundException(ResponseErrors.NOT_FOUND);

    let answerDict = {};
    collections.forEach((collection) => {
      Object.values(collection.questions).forEach((question) => {
        answerDict[question.questionNo] = question.answer;
      });
    });
    return answerDict;
  }

  async getPart(partId: string) {
    const part = await this.partRepo.findOne({
      where: { id: partId },
      join: {
        alias: 'part',
        leftJoinAndSelect: {
          collection: 'part.collections',
        },
      },
    });
    part.collections = part.collections.map((collection) => {
      const { transcript, ...filtered_collection } = collection;
      const filtered_questions = {};
      Object.keys(collection.questions).forEach((key) => {
        const { answer, ...filtered_question } = collection.questions[key];
        filtered_questions[key] = filtered_question;
      });
      filtered_collection.questions = filtered_questions;
      return filtered_collection;
    });
    return part;
  }

  async getTestList() {
    return this.testRepo.find();
  }

  async getTranscript(testId: string) {
    const collections = await this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoin('collection.part', 'part')
      .leftJoin('part.test', 'test')
      .where('test.id = :testId', { testId })
      .select('collection.transcript')
      .getMany();

    if (collections.length == 0)
      throw new NotFoundException(ResponseErrors.NOT_FOUND);

    let transcriptDict = {};
    collections.forEach((collection) => {
      Object.keys(collection.transcript).forEach((questionNo) => {
        transcriptDict[questionNo] = collection.transcript[questionNo];
      });
    });
    return transcriptDict;
  }
}
