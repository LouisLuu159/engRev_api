import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notes } from './entities/note.entity';
import { NoteSearchService } from './noteSearch.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Notes])],
  controllers: [NoteController],
  providers: [NoteSearchService, NoteService],
  exports: [NoteService],
})
export class NoteModule {}
