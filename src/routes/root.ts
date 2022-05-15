import { FastifyPluginAsync } from 'fastify';
import fastifyCors from 'fastify-cors';
const helmet = require('fastify-helmet');

let gameHasStarted = false;

const users: User[] = [];
const shuffledUsers: User[] = [];

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
    return { gameHasStarted };
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
