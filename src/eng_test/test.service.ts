import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { createInterface } from 'node:readline';
import { Readable } from 'stream';
import { once } from 'node:events';
import { TranscriptDictionary } from './interfaces/transcript.interface';
import { Question, QuestionDictionary } from './interfaces/question.interface';
import { Collection } from './entities/collection.entity';
import { TestType, parts, Skills, PartType } from './test.constant';
import { Test } from './entities/test.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';

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

    if (range[0] >= 1 && range[0] < 100) {
      // Exist Listening part

      let ranges = [];
      let part_ranges = Object.values(parts).map((part) => [
        part.range_start,
        part.range_end,
      ]);
      part_ranges.forEach((part_range) => {
        const start = part_range[0];
        const end = part_range[1];
        // if range contain part_range then push part_range to ranges
        if (range[0] <= start && end <= range[1])
          ranges.push(start + '-' + end);
      });
      collectionsRange = ranges;
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
    const insert_promises = creating_parts.map(async (part) => {
      const new_part = await this.partRepo.save(part);
      const creating_collections = part.collections.map((collection) => {
        return { ...collection, partId: new_part.id };
      });
      await this.collectionRepo
        .createQueryBuilder()
        .insert()
        .into(Collection)
        .values(creating_collections)
        .execute();
    });

    await Promise.all(insert_promises);
    return { message: 'Create Test Successfully' };
  }
}
