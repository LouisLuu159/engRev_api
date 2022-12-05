import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHistory } from 'src/history/entities/history.entity';
import { HistoryNote } from 'src/history/entities/historyNote.entity';
import { In, Like, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Notes } from './entities/note.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Notes)
    private readonly noteEntity: Repository<Notes>,

    @InjectRepository(UserHistory)
    private userHistoryEntity: Repository<UserHistory>,
  ) {}

  async createNote(userId: string, note: CreateNoteDto) {
    const new_note = await this.noteEntity.save(note);
    return new_note;
  }

  async deleteNote(userId: string, noteId: string) {
    await this.noteEntity.delete({ id: noteId });
  }

  async getUserNotes(userId: string, word?: string) {
    const historyQuery = this.userHistoryEntity
      .createQueryBuilder('userHistory')
      .leftJoinAndSelect('userHistory.historyNote', 'historyNote')
      .leftJoinAndSelect('historyNote.note', 'note')
      .where('userHistory.userId = :userId', { userId });

    if (word) {
      historyQuery.where('note.wordKey like :word', { word: `%${word}%` });
    }

    const history = await historyQuery.getMany();

    const notes = [];
    history.forEach((record) => {
      record.historyNote.forEach((data) => {
        notes.push(data.note);
      });
    });
    return notes;
  }

  async updateNote(userId: string, noteId: string, note: UpdateNoteDto) {
    const old_note = await this.noteEntity.findOne({ where: { id: noteId } });
    const new_note = { ...old_note, ...note };
    const updated_note = await this.noteEntity.save(new_note);
    return updated_note;
  }

  async deleteMultipleNote(userId: string, noteIds: string[]) {
    await this.noteEntity.delete({ id: In(noteIds) });
  }
}
