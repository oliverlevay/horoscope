import { FastifyPluginAsync } from 'fastify';
import fastifyCors from 'fastify-cors';
const helmet = require('fastify-helmet');

let gameHasStarted = false;

const users: User[] = [
  {id: "a", name: "adam"},
  {id: "b", name: "asfjl"},
  {id: "c", name: "olvie"},
  {id: "d", name: "joajr"},

];
const shuffle = (): UserPair[] => {
  const idMap = new Map();
  const allId = users.map(u => u.id);
  let hasntBeenPicked = users.map(u => u.id);
  for (let i: number = 0; i < allId.length; i++) {
    const pickableId = hasntBeenPicked.filter(j => j !== allId[i]);
    const pickedId = pickableId[Math.floor(Math.random() * pickableId.length)];
    if (pickedId === undefined) return shuffle();

    hasntBeenPicked.splice(hasntBeenPicked.indexOf(pickedId), 1);
    idMap.set(allId[i], pickedId);
  }
  const res: UserPair[] = [];
  idMap.forEach((k, v) => {
    res.push({myId: k, theirId: v});
  });
  return res;
};

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
    const res = shuffle();
    return res;
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
      if (gameHasStarted) {
        reply.badRequest('Game has already started');
      } else {
        const body = request.body as { name: string };
        const user = { id: users.length, name: body.name };
        reply.code(201).send(user);
      }
    }
  );
};

export default root;
