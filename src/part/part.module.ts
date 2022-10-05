import { Module } from '@nestjs/common';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { TestModule } from 'src/eng_test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from 'src/eng_test/entities/part.entity';

@Module({
  imports: [TestModule, TypeOrmModule.forFeature([Part])],
  controllers: [PartController],
  providers: [PartService],
})
export class PartModule {}
