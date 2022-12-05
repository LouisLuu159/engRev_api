import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Req,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import {
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { TestType, parts, Skills, PartType } from './test.constant';
import * as fs from 'fs';
import * as pathHandler from 'path';
import { UploadTestBodyDto } from './dto/uploadTest.dto';
import { Test } from './entities/test.entity';
import { GetTestQueryDto } from './dto/query.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { SubmitTestDto } from './dto/submitTest.dto';
import { S3ClientService } from './s3Client.service';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  @Post('upload')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async upload(
    @Body() body: UploadTestBodyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (body.testType == TestType.SKILL_TEST && !Boolean(body.skillType)) {
      // Test is skill test but skillType is undefined then error
      throw new BadRequestException(
        `skillType is empty when testType is ${TestType.SKILL_TEST}`,
      );
    }

    if (body.testType == TestType.PART_TRAIN && !Boolean(body.partType)) {
      // Test is part training but partType is undefined then error
      throw new BadRequestException(
        `partType is empty when testType is ${TestType.PART_TRAIN}`,
      );
    }

    let range: number[] = [];
    if (body.testType == TestType.FULL_TEST) range = [1, 200];
    else if (body.testType == TestType.SKILL_TEST) {
      // Skill Test
      if (body.skillType == Skills.Listening) range = [1, 100];
      else range = [101, 200];
    } else {
      // Part Train
      const partType = body.partType;
      const part = parts[partType];
      range = [part.range_start, part.range_end];
    }

    if (range[0] >= 1 && range[0] <= 100 && !Boolean(body.audioUrl)) {
      // Exist Listening part but audioUrl is undefined then error
      throw new BadRequestException(
        `audioUrl is empty when exist listening part`,
      );
    }

    let answerKeyFile, transcriptFile, questionFile;
    files.forEach((file) => {
      switch (file.fieldname) {
        case 'questionFile': {
          questionFile = file;
          break;
        }
        case 'answerKeyFile': {
          answerKeyFile = file;
          break;
        }
        case 'transcriptFile': {
          transcriptFile = file;
          break;
        }
      }
    });

    const answerDict = await this.testService.getAnswerDict(
      answerKeyFile,
      range,
    );

    let transcriptDict;
    if (transcriptFile)
      transcriptDict = await this.testService.getTranscriptDict(transcriptFile);

    const getCollectionsPromise = this.testService.getCollections(
      questionFile,
      answerDict,
      transcriptDict,
      range,
    );
    const getImageDataPromise = this.s3ClientService.getImagesData(
      body.folderId,
    );

    const [collections, imagesData] = await Promise.all([
      getCollectionsPromise,
      getImageDataPromise,
    ]);

    let test: Test = {
      type: body.testType,
      name: body.name,
      description: body.description || '',
      // folderId: '1Fs689SSiZcTTtK0d8qNsEYJ6BWhxJqia',
      folderId: body.folderId,
      audioUrl: body.audioUrl,
      parts: [],
      duration: body.duration,
      totalQuestions: 0,
    };
    if (body.skillType) test.skills = body.skillType;
    if (body.partType) test.partType = body.partType;

    if (test.type === TestType.FULL_TEST) {
      //Full Test
      Object.values(parts).forEach((part) => test.parts.push(part));
    } else if (test.type == TestType.SKILL_TEST) {
      //Skill Test
      Object.values(parts)
        .filter(
          (part) => part.range_start >= range[0] && part.range_end <= range[1],
        )
        .forEach((part) => test.parts.push(part));
    } else {
      // Part Train
      test.parts.push(parts[body.partType]);
    }

    imagesData.forEach((data) => {
      const name = data.name.split('.')[0];
      const firstNumber = Number(name.split('-')[0]);
      const collectionIndex = collections.findIndex(
        (collection) =>
          collection.range_start <= firstNumber &&
          firstNumber <= collection.range_end,
      );

      if (firstNumber <= 6) {
        const images = collections[collectionIndex].images;
        collections[collectionIndex].images = [...images, data.url];
      } else {
        let orderIndex = 0;
        const matches = data.name.match(/\((.*)\)/);
        if (matches && matches.length > 1) orderIndex = Number(matches.pop());
        collections[collectionIndex].images[orderIndex] = data.url;
      }
    });

    collections.forEach((collection) => {
      test.totalQuestions += Object.keys(collection.questions).length;
      const partIndex = test.parts.findIndex(
        (part) =>
          part.range_start <= collection.range_start &&
          collection.range_end <= part.range_end,
      );
      const part = test.parts[partIndex];
      const updated_part = { ...part };
      updated_part.collections.push(collection);
      test.parts[partIndex] = updated_part;
    });

    const response = await this.testService.createTest(test);

    // const dstPath = pathHandler.join(__dirname, 'seed/Test2');
    // const testDataPath = pathHandler.join(dstPath, 'testData.json');
    // await fs.promises.writeFile(testDataPath, JSON.stringify(test), 'utf8');
    return response;
  }

  @Get('/full/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get Test Data with collection data` })
  async getWholeTest(
    @Req() req: any,
    @Param('id') testId: string,
    @Query() query: GetTestQueryDto,
  ) {
    const userId = req.user.id;
    return this.testService.getWholeTest(testId, query.skill, userId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Delete Test` })
  async deleteTest(@Param('id') testId: string) {
    return this.testService.deleteTest(testId);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get Test Data without collection data` })
  async getTest(@Param('id') testId: string) {
    return this.testService.getTest(testId);
  }

  @Get(':id/answer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get Answer Data` })
  async getAnswer(@Param('id') testId: string) {
    return this.testService.getAnswer(testId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get List of Test` })
  async getTestList(@Query() query: GetTestQueryDto) {
    return this.testService.getTestList(query);
  }

  @Get(':id/transcript')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get Transcript Data` })
  async getTranscript(@Param('id') testId: string) {
    return this.testService.getTranscript(testId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Submit Test` })
  async submitTest(@Req() req: any, @Body() body: SubmitTestDto) {
    const userId = req.user.id;
    return this.testService.submitTest(userId, body);
  }
}
