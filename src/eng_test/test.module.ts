import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { Collection } from './entities/collection.entity';
import { Part } from './entities/part.entity';
import { HistoryModule } from 'src/history/history.module';
import { UserModule } from 'src/user/user.module';
import { S3ClientService } from './s3Client.service';

@Module({
  imports: [
    HistoryModule,
    UserModule,
    TypeOrmModule.forFeature([Test, Collection, Part]),
  ],
  controllers: [TestController],
  providers: [TestService, S3ClientService],
})
export class TestModule {}
