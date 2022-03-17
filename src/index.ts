import path from 'path';
import fp from 'fastify-plugin';
import type {
  IFs,
} from 'memfs';
import {
  createFsFromVolume,
  Volume,
} from 'memfs';
import mime from 'mime-types';
import Negotiator from 'negotiator';
import {
  serializeError,
} from 'serialize-error';
import type {
  Compiler,
  Stats,
} from 'webpack';
import {
  Logger,
} from './Logger';
import {
  type DeferredPromise,
  defer,
} from './utilities/defer';
import {
  getFilenameFromUrl,
} from './utilities/getFilenameFromUrl';

const MODULE_NAME = 'fastify-webpack';

const log = Logger.child({
  namespace: 'fastifyWebpack',
});

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    webpack: {
      outputFileSystem: IFs,
    };
  }
}

type Configuration = {
  compiler: Compiler,
};

export const fastifyWebpack = fp<Configuration>(async (fastify, options) => {
  const {
    compiler,
  } = options;

  let statsPromise: DeferredPromise<Stats> = defer();

  compiler.hooks.watchRun.tap(MODULE_NAME, () => {
    statsPromise = defer();

    // if (compiler.modifiedFiles) {
    //   const changedFiles = Array.from(compiler.modifiedFiles, (file) => {
    //     return `\n  ${file}`;
    //   }).join('');
    //   console.log('===============================');
    //   console.log('FILES CHANGED:', changedFiles);
    //   console.log('===============================');
    // }

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

    log.debug('webpack build is ready');

    statsPromise.resolve(nextStats);
  });

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return;
    }

    if (!statsPromise.resolved) {
      log.info('waiting for the compiler to finish bundling');
    }

    const stats = await statsPromise.promise;

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
    } else {
      request.webpack = {
        outputFileSystem,
      };
    }
  });
});
