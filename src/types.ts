type User = {
  id: string;
  name: string;
  isAdmin: boolean;
};

type Word = {
  index: number;
  word: string;
};

type WordList = Word[];

type Sentence = {
  belongsTo: string;
  words: string[];
};

type UserPair = {
  myId: string;
  theirId: string;
};
