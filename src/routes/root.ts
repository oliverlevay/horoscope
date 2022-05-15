import { FastifyPluginAsync } from 'fastify';
import fastifyCors from 'fastify-cors';
import { v4 as uuidv4 } from 'uuid';
const helmet = require('fastify-helmet');

let gameState: GameState = GameState.NotStarted;

const shuffleUsers = () => {
  const idMap = new Map();
  const allId = users.map((u) => u.id);
  let hasntBeenPicked = users.map((u) => u.id);
  for (let i: number = 0; i < allId.length; i++) {
    const pickableId = hasntBeenPicked.filter((j) => j !== allId[i]);
    const pickedId = pickableId[Math.floor(Math.random() * pickableId.length)];
    if (pickedId === undefined) {
      shuffleUsers();
      return;
    }

    hasntBeenPicked.splice(hasntBeenPicked.indexOf(pickedId), 1);
    idMap.set(allId[i], pickedId);
  }
  randomUsers = idMap;
};

let randomUsers: Map<string, string> = new Map();
const users: User[] = [];

// userId, sentence pairs
const sentences: Map<string, string> = new Map();

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
const generateWordList = (words: string[]): WordList => {
  const randomWords = glues.sort(() => 0.5 - Math.random()).slice(0, 4);
  const randomIndexes = randomWords.map((word) => words.indexOf(word));
  return randomIndexes.map((index) => {
    return { index, word: glues[index] };
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
        reply.badRequest('Game has already started');
      } else {
        const body = request.body as { name: string };
        const user = {
          id: uuidv4(),
          name: body.name,
          isAdmin: users.length === 0,
        };
        users.push(user);
        reply.code(201).send(user);
      }
    }
  );

  fastify.post(
    '/start-game',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'id'],
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
        reply.badRequest('Game has already started');
      }
      const body = request.body as { id: string };
      if (!users.find((user) => user.id === body.id)?.isAdmin) {
        reply.badRequest('Only admins can start the game');
      }
      gameState = GameState.Step1;
      shuffleUsers();
      reply.code(200).send({ success: true });
    }
  );

  fastify.get(
    '/step1',
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
        reply.badRequest('Waiting for game to start...');
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        reply.badRequest('User not found');
      } else {
        reply.code(201).send(generateWordList(glues));
      }
    }
  );

  fastify.post(
    '/step1',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'myId'],
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
        reply.badRequest('Waiting for other players...');
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        reply.badRequest('User not found in current game.');
      }
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const sentence = `${randomUser.name} ${glues[body.index]}`;
      sentences.set(randomUser.id, sentence);
    }
  );

  fastify.get(
    '/step2',
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
        reply.badRequest('Game has not started');
      }
      const body = request.body as { id: string };
      const id = body.id;
      const ids = users.map((user) => user.id);
      if (!ids.includes(id)) {
        reply.badRequest('User not found in current game.');
      } else {
        reply.code(201).send(generateWordList(verbs));
      }
    }
  );

  fastify.post(
    '/step1',
    {
      schema: {
        body: {
          type: 'object',
          required: ['index', 'myId'],
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
      if (gameState !== GameState.NotStarted) {
        reply.badRequest('Game has not started');
      }
      const body = request.body as { id: string; index: number };
      const ids = users.map((user) => user.id);
      if (!ids.includes(body.id)) {
        reply.badRequest('User not found in current game.');
      }
      const randomUser = randomUsers.get(body.id);
      const sentence = `${randomUser.name} ${glues[body.index]}`;
      sentences.set(randomUser.id, sentence);
    }
  );
};

export default root;
