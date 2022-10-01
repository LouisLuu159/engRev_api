export interface QuestionDictionary {
  [questionNo: string]: Question;
}

interface Question {
  questionNo: string;
  questionCont: string;
  answer: string;
  options: OptionDictionary;
}

interface OptionDictionary {
  [letter: string]: string;
}
