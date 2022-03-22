import EventEmitter from 'events';
import path from 'path';
import fp from 'fastify-plugin';
import {
  createFsFromVolume,
  Volume,
} from 'memfs';
import mime from 'mime-types';
import Negotiator from 'negotiator';
import {
  serializeError,
} from 'serialize-error';
import type TypedEmitter from 'typed-emitter';
import type {
  Compiler,
  Stats,
} from 'webpack';
import {
  Logger,
} from './Logger';
import {
  createSyncEvents,
} from './factories/createSyncEvents';
import type {
  SyncEvent,
} from './types';
import {
  type DeferredPromise,
  defer,
} from './utilities/defer';
import {
  getFilenameFromUrl,
} from './utilities/getFilenameFromUrl';

type EventHandlers = {
  sync: (event: SyncEvent) => void,
};

const MODULE_NAME = 'fastify-webpack';

const log = Logger.child({
  namespace: 'fastifyWebpack',
});

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    webpack: {
      stats: Stats,
    };
  }
}

type Configuration = {
  compiler: Compiler,
};

export const fastifyWebpack = fp<Configuration>(async (fastify, options) => {
  const eventEmitter = new EventEmitter() as TypedEmitter<EventHandlers>;

  const {
    compiler,
  } = options;

  let statsPromise: DeferredPromise<Stats> = defer();

  // compiler.hooks.done.tap(MODULE_NAME, () => {

  //   eventEmitter.emit('sync', {
  //     time: Date.now(),
  //   });
  // });

  compiler.hooks.watchRun.tap(MODULE_NAME, () => {
    if (statsPromise.resolved) {
      statsPromise = defer();
    }

    if (compiler.modifiedFiles) {
      const modifiedFiles = Array.from(compiler.modifiedFiles);

      log.info({
        modifiedFiles,
      }, 'modified files');
    }

    log.debug('building a webpack bundle');
  });

  const outputFileSystem = createFsFromVolume(new Volume());

  compiler.outputFileSystem = outputFileSystem;

  compiler.watch({
    poll: false,
  }, (error, nextStats) => {
    if (error) {
      log.error({
        error: serializeError(error),
      }, 'invalid build');

      return;
    }

    if (!nextStats) {
      throw new Error('Expected nextState to be defined');
    }

    log.debug('webpack build is ready');

    statsPromise.resolve(nextStats);

    const syncEvents = createSyncEvents(nextStats);

    for (const syncEvent of syncEvents) {
      eventEmitter.emit('sync', syncEvent);
    }
  });

  fastify.get('/hmr', (request, reply) => {
    const headers = {
      'cache-control': 'no-store',
      'content-type': 'text/event-stream',
    };

    reply.raw.writeHead(200, headers);

    const sync = (event) => {
      reply.raw.write('event: sync\ndata: ' + JSON.stringify(event) + '\n\n');
    };

    eventEmitter.addListener('sync', sync);

    request.raw.on('close', () => {
      eventEmitter.removeListener('sync', sync);
    });
  });

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return;
    }

    if (!statsPromise.resolved) {
      log.info('waiting for the compiler to finish bundling');
    }

    const stats = await statsPromise.promise;

    // eslint-disable-next-line require-atomic-updates
    request.webpack = {
      stats,
    };

    const fileName = getFilenameFromUrl(outputFileSystem, stats, request.url);

    if (fileName) {
      const contentType = mime.contentType(path.extname(fileName));

      if (contentType) {
        void reply.header('content-type', contentType);
      }

      const negotiator = new Negotiator(request.raw);
      const encodings = negotiator.encodings();

      if (encodings.includes('br') && outputFileSystem.existsSync(fileName + '.br')) {
        void reply.header('content-encoding', 'br');
        void reply.send(outputFileSystem.readFileSync(fileName + '.br'));
      } else if (encodings.includes('gzip') && outputFileSystem.existsSync(fileName + '.gz')) {
        void reply.header('content-encoding', 'gzip');
        void reply.send(outputFileSystem.readFileSync(fileName + '.gz'));
      } else {
        void reply.send(outputFileSystem.readFileSync(fileName));
      }
    }
  });
});
