export type User = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type Word = {
  index: number;
  word: string;
};

export type WordList = Word[];

export type Sentence = {
  belongsTo: string;
  words: string[];
};

export type UserPair = {
  myId: string;
  theirId: string;
};

export enum GameState {
  NotStarted,
  Step1,
  Step2,
  Step3,
  Step4,
  Finished,
}
