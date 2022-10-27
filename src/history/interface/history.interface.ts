import { PartType, Skills } from 'src/eng_test/test.constant';

export interface AnswerSheet {
  [questionNo: string]: {
    answer?: string;
    questionAnswer?: string;
    collectionId: string;
    partId: string;
  };
}

export interface PartScores {
  [partType: string]: {
    partId: string;
    score: number;
    totalQuestions: number;
    skill: Skills;
  };
}
