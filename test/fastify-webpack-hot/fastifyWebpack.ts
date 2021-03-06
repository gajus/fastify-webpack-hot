import fs from 'node:fs/promises';
import path from 'node:path';
import {
  setTimeout,
} from 'node:timers/promises';
import test from 'ava';
import CompressionPlugin from 'compression-webpack-plugin';
import createFastify from 'fastify';
import got from 'got';
import type {
  Message,
} from 'roarr';
import {
  Roarr,
} from 'roarr';
import webpack from 'webpack';
import {
  fastifyWebpackHot,
} from '../../src';
import type {
  SyncEvent,
} from '../../src/types';

test('builds and serves bundle', async (t) => {
  const app = createFastify();

  const compiler = webpack({
    entry: path.resolve(__dirname, '../fixtures/index.js'),
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  const serverAddress = await app.listen(0);

  const response = await got(serverAddress + '/main.js', {
    resolveBodyOnly: true,
  });

  t.is(response, 'console.log("Hello, World");');
});

test('serves brotli compressed assets when available', async (t) => {
  const app = createFastify();

  const compiler = webpack({
    entry: path.resolve(__dirname, '../fixtures/index.js'),
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
    plugins: [
      new CompressionPlugin({
        algorithm: 'brotliCompress',
        deleteOriginalAssets: false,
        filename: '[path][base].br',
        minRatio: Number.POSITIVE_INFINITY,
        test: /\.js$/u,
        threshold: 0,
      }),
    ],
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  const serverAddress = await app.listen(0);

  const response = await got(serverAddress + '/main.js', {
    headers: {
      'accept-encoding': 'br',
    },
  });

  t.is(response.headers['content-encoding'], 'br');
});

test('serves gzip compressed assets when available', async (t) => {
  const app = createFastify();

  const compiler = webpack({
    entry: path.resolve(__dirname, '../fixtures/index.js'),
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
        deleteOriginalAssets: false,
        filename: '[path][base].gz',
        minRatio: Number.POSITIVE_INFINITY,
        test: /\.js$/u,
        threshold: 0,
      }),
    ],
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  const serverAddress = await app.listen(0);

  const response = await got(serverAddress + '/main.js', {
    headers: {
      'accept-encoding': 'gzip',
    },
  });

  t.is(response.headers['content-encoding'], 'gzip');
});

test('logs modified files', async (t) => {
  const app = createFastify();

  const compiler = webpack({
    entry: path.resolve(__dirname, '../fixtures/index.js'),
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  const messages: Message[] = [];

  void Roarr.adopt(async () => {
    await app.listen(0);
  }, (message) => {
    messages.push(message);

    return message;
  });

  await fs.utimes(path.resolve(__dirname, '../fixtures/index.js'), new Date(), new Date());

  await setTimeout(1_000);

  const modifiedFilesLogMessage = messages.find((message) => {
    return message.message === 'building a webpack bundle' && message.context.modifiedFiles;
  });

  if (!modifiedFilesLogMessage) {
    throw new Error('log message not found');
  }

  t.true(Array.isArray(modifiedFilesLogMessage.context.modifiedFiles));
});

test('__fastify_webpack_hot pushes updates', async (t) => {
  const app = createFastify();

  const compiler = webpack({
    entry: path.resolve(__dirname, '../fixtures/index.js'),
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  const address = await app.listen(0);

  const stream = got.stream(address + '/__fastify_webpack_hot');

  const syncEvents: SyncEvent[] = [];

  stream.on('data', (data) => {
    if (data.toString().startsWith('event: sync')) {
      const syncEvent = JSON.parse(data.toString().split('data: ')[1]);

      syncEvents.push(syncEvent);
    }
  });

  await fs.utimes(path.resolve(__dirname, '../fixtures/index.js'), new Date(), new Date());

  await setTimeout(1_000);

  stream.destroy();

  t.is(syncEvents.length, 1);

  t.like(syncEvents[0], {
    errors: [],
    hash: '673c6c371ec5fcb8e982',
    modules: {
      undefined: './test/fixtures/index.js',
    },
    warnings: [],
  });
});
