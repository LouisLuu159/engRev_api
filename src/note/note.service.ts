import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './entities/note.entity';

export interface NoteSearchBody {
  id: string;
  wordKey: string;
  tags?: string;
  en_meaning?: string;
  noteType: string;
  color: string;
}

export interface NoteSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: NoteSearchBody;
    }>;
  };
}

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Notes)
    private readonly noteEntity: Repository<Notes>,
  ) {}

  async createNote(userId: string, note: CreateNoteDto) {
    const new_note = await this.noteEntity.save(note);
    return new_note;
  }

  async getNoteByWord(userId: string, word: string) {
    const results = [];
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
    // await NoteSearchService.deleteNote(userId, noteId);
  }

  async getAllNote(userId: string) {
    const results = [];
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }

    return this.noteEntity.find({
      where: { id: In(ids) },
    });
  }

  async getListOfWordKey(userId: string) {
    return [];
  }
}
