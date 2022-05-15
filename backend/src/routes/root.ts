import { FastifyPluginAsync } from 'fastify';
import fastifyCors from 'fastify-cors';
import { v4 as uuidv4 } from 'uuid';
const helmet = require('fastify-helmet');

enum GameState {
  NotStarted,
  Step1,
  Step2,
  Step3,
  Step4,
  Finished,
}

let gameState: GameState = GameState.NotStarted;
let randomUsers: Map<string, User> = new Map();
let users: User[] = [];

let usersFinishedWithStep = 0;

const shuffleUsers = () => {
  const idMap: Map<string, User> = new Map();
  if (users.length === 1) {
    idMap.set(users[0].id, users[0]);
  } else {
    let hasntBeenPicked = [...users];
    for (let i: number = 0; i < users.length; i++) {
      const pickableId = hasntBeenPicked.filter((j) => j.id !== users[i].id);
      const pickedId =
        pickableId[Math.floor(Math.random() * pickableId.length)];
      if (pickedId === undefined) {
        shuffleUsers();
        return;
      }

      hasntBeenPicked.splice(hasntBeenPicked.indexOf(pickedId), 1);
      idMap.set(users[i].id, pickedId);
    }
  }
  randomUsers = idMap;
};

// userId, sentence pairs
const sentences: Map<string, string[]> = new Map();

const glues = [
  'will',
  "won't",
  "doesn't",
  "won't",
  'wants to',
  "doesn't want to",
];
const verbs = [
  'eat',
  'drink',
  'play with',
  'watch',
  'read',
  'write',
  'sleep in',
  'go to',
];
const nouns = [
  'a book',
  'a car',
  'a computer',
  'a table',
  'a chair',
  'a pen',
  'a pencil',
  'a phone',
  'Rome',
];
const time = [
  'today',
  'tomorrow',
  'in the future',
  'soon',
  'in a couple of hours',
];
// takes a list of words and returns 4 random ones with their index.

const gameInfo = () => {
  return { gameState, usersFinishedWithStep, usersInGame: users.length };
};

const generateWordList = (words: string[]): WordList => {
  const randomWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 4);
  const randomIndexes = randomWords.map((word) => words.indexOf(word));
  return randomIndexes.map((index) => {
    return { index, word: words[index] };
  });
};
//const shuffledUsers: User[] = [];

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(helmet, (instance) => {
    return {
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'form-action': ["'self'"],
          'img-src': ["'self'", 'data:', 'validator.swagger.io'],
        },
      },
    };
  });
  fastify.register(fastifyCors, {
    origin: '*',
  });

  fastify.get('/', async (request, reply) => {
    shuffleUsers();
    return randomUsers;
  });

  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.NotStarted) {
        return { ...gameInfo(), error: 'Game has already started' };
      } else {
        const body = request.body as { name: string };
        const user = {
          id: uuidv4(),
          name: body.name,
          isAdmin: users.length === 0,
        };
        users.push(user);
        console.log(
          `Register ${user.name} with id ${user.id}. He/she is ${user.isAdmin} admin`
        );
        reply.code(201).send({ user, ...gameInfo() });
      }
    }
  );

  fastify.post(
    '/start-game',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.NotStarted) {
        return { ...gameInfo(), error: 'Game has already started' };
      }
      const body = request.body as { id: string };
      if (!users.find((user) => user.id === body.id)?.isAdmin) {
        reply.badRequest('Only admins can start the game');
      }
      gameState = GameState.Step1;
      shuffleUsers();
      usersFinishedWithStep = 0;
      console.log(gameInfo());
      reply.code(200).send({ ...gameInfo() });
    }
  );

  fastify.post(
    '/get-words/step1',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step1) {
        return { ...gameInfo(), error: 'Game is not in step 1' };
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        console.log(`There is no user with ${id}`);
        reply.badRequest('User not found');
      } else {
        console.log(`The user with id ${id} got the words`);
        reply
          .code(201)
          .send({ wordList: generateWordList(glues), ...gameInfo() });
      }
    }
  );

  fastify.post(
    '/select-word/step1',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'id'],
          properties: {
            index: {
              type: 'number',
            },
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step1) {
        return { ...gameInfo(), error: 'Game is not in step 1' };
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      }
      const randomUser = randomUsers.get(body.id)!;
      sentences.set(randomUser.id, [randomUser.name, glues[body.index]]);
      usersFinishedWithStep += 1;
      if (usersFinishedWithStep === users.length) {
        gameState = GameState.Step2;
        usersFinishedWithStep = 0;
        shuffleUsers();
      }
      console.log(
        `The user with ${body.id} sent the word ${glues[body.index]}`
      );
      reply.code(201).send({ ...gameInfo() });
    }
  );

  fastify.post(
    '/get-words/step2',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step2) {
        return { ...gameInfo(), error: 'Game is not in step 1' };
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      } else {
        console.log(`The user with id ${id} got the words`);
        reply
          .code(201)
          .send({ wordList: generateWordList(verbs), ...gameInfo() });
      }
    }
  );

  fastify.post(
    '/select-word/step2',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'id'],
          properties: {
            index: {
              type: 'number',
            },
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step2) {
        return { ...gameInfo(), error: 'Game is not in step 2' };
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      }
      const randomUser = randomUsers.get(body.id)!;
      const existingWords = sentences.get(randomUser.id)!;
      sentences.set(randomUser.id, [...existingWords, verbs[body.index]]);
      usersFinishedWithStep += 1;
      if (usersFinishedWithStep === users.length) {
        gameState = GameState.Step3;
        usersFinishedWithStep = 0;
        shuffleUsers();
      }
      console.log(
        `The user with ${body.id} sent the word ${glues[body.index]}`
      );
      reply.code(201).send({ ...gameInfo() });
    }
  );

  fastify.post(
    '/get-words/step3',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step3) {
        return { ...gameInfo(), error: 'Game is not in step 3' };
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      } else {
        console.log(`The user with id ${id} got the words`);
        reply
          .code(201)
          .send({ wordList: generateWordList(nouns), ...gameInfo() });
      }
    }
  );

  fastify.post(
    '/select-word/step3',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'id'],
          properties: {
            index: {
              type: 'number',
            },
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step3) {
        return { ...gameInfo(), error: 'Game is not in step 3' };
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      }
      const randomUser = randomUsers.get(body.id)!;
      const existingWords = sentences.get(randomUser.id)!;
      sentences.set(randomUser.id, [...existingWords, nouns[body.index]]);
      usersFinishedWithStep += 1;
      if (usersFinishedWithStep === users.length) {
        gameState = GameState.Step4;
        usersFinishedWithStep = 0;
        shuffleUsers();
      }
      console.log(
        `The user with ${body.id} sent the word ${glues[body.index]}`
      );
      reply.code(201).send({ ...gameInfo() });
    }
  );

  fastify.post(
    '/get-words/step4',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step4) {
        return { ...gameInfo(), error: 'Game is not in step 4' };
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      } else {
        console.log(`The user with id ${id} got the words`);
        reply
          .code(201)
          .send({ wordList: generateWordList(time), ...gameInfo() });
      }
    }
  );

  fastify.post(
    '/select-word/step4',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'id'],
          properties: {
            index: {
              type: 'number',
            },
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Step4) {
        return { ...gameInfo(), error: 'Game is not in step 4' };
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        console.log(`There is no user with ${body.id}`);
        reply.badRequest('User not found in current game.');
      }
      const randomUser = randomUsers.get(body.id)!;
      const existingWords = sentences.get(randomUser.id)!;
      sentences.set(randomUser.id, [...existingWords, time[body.index]]);
      usersFinishedWithStep += 1;
      if (usersFinishedWithStep === users.length) {
        gameState = GameState.Finished;
        usersFinishedWithStep = 0;
        shuffleUsers();
      }
      console.log(
        `The user with ${body.id} sent the word ${glues[body.index]}`
      );
      reply.code(201).send({ ...gameInfo() });
    }
  );

  fastify.get('/sentences', async (request, reply) => {
    const res: string[] = [];
    sentences.forEach((v) => {
      res.push(v.join(' '));
    });
    if (gameState !== GameState.Finished) {
      return { ...gameInfo(), error: 'Game is not finished', sentences: res };
    }
    return { ...gameInfo(), sentences: res };
  });

  fastify.post(
    '/reset',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (gameState !== GameState.Finished) {
        return { ...gameInfo(), error: 'Game is not finished' };
      }
      const body = request.body as { id: string };
      if (!users.find((user) => user.id === body.id)?.isAdmin) {
        reply.badRequest('Only admins can reset the game');
      }
      gameState = GameState.NotStarted;
      users = [];
      sentences.clear();
      usersFinishedWithStep = 0;
      console.log('Game reset', gameInfo());
      reply.code(200).send({ ...gameInfo() });
    }
  );
};

export default root;
