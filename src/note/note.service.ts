import { Client } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Notes } from './entities/note.entity';
import { NoteSearchBody, NoteSearchService } from './noteSearch.service';

@Injectable()
export class NoteService {
  constructor(
    private readonly noteSearchService: NoteSearchService,
    @InjectRepository(Notes)
    private readonly noteEntity: Repository<Notes>,
  ) {}

  async createNote(userId: string, note: CreateNoteDto) {
    const new_note = await this.noteEntity.save(note);
    let noteBody: NoteSearchBody = {
      id: new_note.id,
      color: new_note.color,
      en_meaning: new_note.en_meaning,
      noteType: new_note.noteType,
      tags: new_note.tags,
      wordKey: new_note.wordKey,
    };

    try {
      await this.noteSearchService.createNote(userId, noteBody);
    } catch (error) {
      await this.noteEntity.delete({ id: new_note.id });
    }
    return new_note;
  }

  async deleteNote(userId: string, noteId: string) {
    await this.noteEntity.delete({ id: noteId });
    await this.noteSearchService.deleteNote(userId, noteId);
  }

  async getUserNotes(userId: string, word?: string) {
    const results = await this.noteSearchService.getUserNotes(userId, word);
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }

    return this.noteEntity.find({
      where: { id: In(ids) },
    });
  }

  async updateNote(userId: string, noteId: string, note: UpdateNoteDto) {
    const old_note = await this.noteEntity.findOne({ where: { id: noteId } });
    const new_note = { ...old_note, ...note };
    let noteBody: NoteSearchBody = {
      id: new_note.id,
      color: new_note.color,
      en_meaning: new_note.en_meaning,
      noteType: new_note.noteType,
      tags: new_note.tags,
      wordKey: new_note.wordKey,
    };

    const updated_note = await this.noteEntity.save(new_note);
    try {
      await this.noteSearchService.updateNote(userId, noteBody);
    } catch (error) {
      console.log(error);
      await this.noteEntity.save(old_note);
      throw error;
    }
    return updated_note;
  }

  async deleteMultipleNote(userId: string, noteIds: string[]) {
    await this.noteEntity.delete({ id: In(noteIds) });
    await this.noteSearchService.deleteMultipleNote(userId, noteIds);
  }
}
