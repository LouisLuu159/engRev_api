import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './entities/note.entity';
import { NoteSearchService } from './noteSearch.service';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Notes)
    private readonly noteEntity: Repository<Notes>,
    private readonly noteSearchService: NoteSearchService,
  ) {}

  async createNote(userId: string, note: CreateNoteDto) {
    const new_note = await this.noteEntity.save(note);
    await this.noteSearchService.createNote(userId, new_note);
    return new_note;
  }

  async getNoteByWord(userId: string, word: string) {
    const results = await this.noteSearchService.searchNoteByWordKey(
      userId,
      word,
    );
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }

    return this.noteEntity.find({
      where: { id: In(ids) },
    });
  }

  async deleteNote(userId: string, noteId: string) {
    await this.noteEntity.delete({ id: noteId });
    await this.noteSearchService.deleteNote(userId, noteId);
  }
}
