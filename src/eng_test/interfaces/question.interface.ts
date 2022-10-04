export interface QuestionDictionary {
  [questionNo: string]: Question;
}

export interface Question {
  questionNo: string;
  content: string;
  answer?: string;
  options: OptionDictionary;
}

interface OptionDictionary {
  [letter: string]: string;
}
