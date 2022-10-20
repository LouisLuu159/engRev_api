export enum TestType {
  'FULL_TEST' = 'FULL_TEST',
  'SKILL_TEST' = 'SKILL_TEST',
  'PART_TRAIN' = 'PART_TRAIN',
}

export enum Skills {
  'Reading' = 'Reading',
  'Listening' = 'Listening',
}

export enum PartType {
  'PART1' = 'PART1',
  'PART2' = 'PART2',
  'PART3' = 'PART3',
  'PART4' = 'PART4',
  'PART5' = 'PART5',
  'PART6' = 'PART6',
  'PART7' = 'PART7',
  'PART7S' = 'PART7S',
  'PART7M' = 'PART7M',
}

interface PartsDictionary {
  [partType: string]: {
    type: PartType;
    range_start: number;
    range_end: number;
    skill: Skills;
    collections: [];
  };
}

export const parts: PartsDictionary = {
  PART1: {
    type: PartType.PART1,
    range_start: 1,
    range_end: 6,
    skill: Skills.Listening,
    collections: [],
  },
  PART2: {
    type: PartType.PART2,
    range_start: 7,
    range_end: 31,
    skill: Skills.Listening,
    collections: [],
  },
  PART3: {
    type: PartType.PART3,
    range_start: 32,
    range_end: 70,
    skill: Skills.Listening,
    collections: [],
  },
  PART4: {
    type: PartType.PART4,
    range_start: 71,
    range_end: 100,
    skill: Skills.Listening,
    collections: [],
  },
  PART5: {
    type: PartType.PART5,
    range_start: 101,
    range_end: 130,
    skill: Skills.Reading,
    collections: [],
  },
  PART6: {
    type: PartType.PART6,
    range_start: 131,
    range_end: 146,
    skill: Skills.Reading,
    collections: [],
  },
  PART7S: {
    type: PartType.PART7S,
    range_start: 147,
    range_end: 175,
    skill: Skills.Reading,
    collections: [],
  },
  PART7M: {
    type: PartType.PART7M,
    range_start: 176,
    range_end: 200,
    skill: Skills.Reading,
    collections: [],
  },
};
