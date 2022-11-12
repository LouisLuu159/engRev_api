import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { UserHistory } from './entities/history.entity';
import { HistoryDetail } from './entities/historyDetail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteModule } from 'src/note/note.module';

@Module({
  imports: [NoteModule, TypeOrmModule.forFeature([UserHistory, HistoryDetail])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
