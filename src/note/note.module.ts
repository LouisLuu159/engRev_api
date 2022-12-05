import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notes } from './entities/note.entity';
import { HistoryNote } from 'src/history/entities/historyNote.entity';
import { UserHistory } from 'src/history/entities/history.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notes, UserHistory, HistoryNote]),
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
