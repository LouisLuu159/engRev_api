import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { Collection } from './entities/collection.entity';
import { Part } from './entities/part.entity';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [HistoryModule, TypeOrmModule.forFeature([Test, Collection, Part])],
  controllers: [TestController],
  providers: [TestService, DriverService],
})
export class TestModule {}
