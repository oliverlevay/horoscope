import { FastifyPluginAsync } from 'fastify';
import fastifyCors from 'fastify-cors';
const helmet = require('fastify-helmet');


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

  fastify.register(require('fastify-swagger'), {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Dsek order API',
        description: 'Backend for our internal order system',
        version: '0.1.0',
      },
      host: 'dsek-order-app.herokuapp.com',
      schemes: ['https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
      },
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    exposeRoute: true,
  });

  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    function (req, body: string, done) {
      try {
        const json = JSON.parse(body);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  );

  fastify.get('/', async (request, reply) => { 
    return { root: 'Hello World' };
   }
  );
};

export default root;
