import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';

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

const Types = {
  NOTE: 'Note',
  WORD_KEYS: 'Word_keys',
};

export class NoteSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {
    const config = {
      node: process.env.ELASTIC_NODE,
      auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
      },
    };
    this.elasticsearchService = new Client(config);
    console.log('config: ', config);
  }

  async createNote(userId: string, noteBody: NoteSearchBody) {
    return this.elasticsearchService.index<NoteSearchResult, NoteSearchBody>({
      index: userId,
      body: noteBody,
      type: Types.NOTE,
      id: noteBody.id,
    });
  }

  async getListOfNoteKey(userId: string) {
    const response = await this.elasticsearchService.indices.exists({
      index: userId,
    });
    const checkIndexExist = response.body;
    console.log(checkIndexExist);
    if (!checkIndexExist) return [];

    const { body } = await this.elasticsearchService.search({
      index: userId,
      type: Types.NOTE,
      body: {
        aggs: {
          keys: {
            terms: {
              field: 'wordKey.keyword',
            },
          },
        },
        size: 0,
      },
    });

    const noteKeys = body.aggregations.keys.buckets.map((obj) => obj.key);
    return noteKeys;
  }

  async deleteNote(userId: string, noteId: string) {
    return this.elasticsearchService.delete({
      index: userId,
      id: noteId,
      type: 'Note',
    });
  }

  async getUserNotes(userId: string, word?: string) {
    const response = await this.elasticsearchService.indices.exists({
      index: userId,
    });
    const checkIndexExist = response.body;
    console.log(checkIndexExist);
    if (!checkIndexExist) return [];

    let searchBody = undefined;
    if (word)
      searchBody = {
        query: {
          bool: {
            should: [{ term: { wordKey: word } }],
          },
        },
      };

    const { body } = await this.elasticsearchService.search({
      index: userId,
      type: 'Note',
      body: searchBody,
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }

  async updateNote(userId: string, noteBody: NoteSearchBody) {
    const script = Object.entries(noteBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');
    try {
      const note = await this.elasticsearchService.update_by_query({
        index: userId,
        body: {
          query: {
            match: {
              id: noteBody.id,
            },
          },
          script: {
            inline: script,
          },
        },
      });
      return note;
    } catch (error) {
      throw error;
    }
  }

  async deleteMultipleNote(userId: string, noteIds: string[]) {
    return this.elasticsearchService.deleteByQuery({
      index: userId,
      type: Types.NOTE,
      body: {
        query: {
          terms: {
            _id: noteIds,
          },
        },
      },
    });
  }
}
