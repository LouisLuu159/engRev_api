import { Client } from '@elastic/elasticsearch';

const Types = {
  NOTE: 'Note',
  WORD_KEYS: 'Word_keys',
};

const elasticsearchService = new Client({
  node: 'http://127.0.0.1:9200',
  auth: {
    username: 'elastic',
    password: 'elastic@engRev',
  },
});

export class NoteSearchService {
  static async createNote(userId, noteBody) {
    return elasticsearchService.index({
      index: userId,
      body: noteBody,
      type: Types.NOTE,
      id: noteBody.id,
    });
  }

  static async getListOfWordKey(userId) {
    console.log('search');

    const result = elasticsearchService.search({
      index: userId,
      type: Types.NOTE,
    });
    return result;

    const checkIndexExist = await elasticsearchService.indices.exists({
      index: userId,
    });
    if (!checkIndexExist) return [];
    return checkIndexExist;

    return elasticsearchService.search({
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
  }

  static async deleteNote(userId, noteId) {
    return elasticsearchService.delete({
      index: userId,
      id: noteId,
      type: 'Note',
    });
  }

  static async searchNoteByWordKey(userId, text) {
    const { body } = await elasticsearchService.search({
      index: userId,
      type: 'Note',
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

  static async getAllUserNotes(userId) {
    const { body } = await elasticsearchService.search({
      index: userId,
      type: 'Note',
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
