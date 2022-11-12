import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Repository } from 'typeorm';
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

const type = 'Note';

@Injectable()
export class NoteSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createNote(userId: string, noteBody: NoteSearchBody) {
    return this.elasticsearchService.index<NoteSearchResult, NoteSearchBody>({
      index: userId,
      body: noteBody,
      type: type,
      id: noteBody.id,
    });
  }

  async getListOfWordKey(userId: string) {
    return this.elasticsearchService.search({
      index: userId,
      type: type,
      body: {
        aggs: {
          distinct_colors: {
            terms: {
              field: 'wordKey',
            },
          },
        },
      },
    });
  }

  async deleteNote(userId: string, noteId: string) {
    return this.elasticsearchService.delete({
      index: userId,
      id: noteId,
      type: type,
    });
  }

  async searchNoteByWordKey(userId: string, text: string) {
    const { body } = await this.elasticsearchService.search<NoteSearchResult>({
      index: userId,
      body: {
        query: {
          bool: {
            should: [{ term: { wordKey: text } }],
          },
        },
      },
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
