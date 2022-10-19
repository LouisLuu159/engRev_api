import { PartType } from 'src/eng_test/test.constant';

export interface AnswerSheetHistory {
  [questionNo: string]: {
    choice: string;
    answer: string;
  };
}

export interface PartScores {
  [partType: string]: number;
}
