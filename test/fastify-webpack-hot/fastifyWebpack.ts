import fs from 'fs';
import path from 'path';
import {
  setTimeout,
} from 'timers/promises';
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

  const messages: Message[] = [];

  void Roarr.adopt(async () => {
    await app.listen(0);
  }, (message) => {
    messages.push(message);

    return message;
  });

  fs.utimesSync(path.resolve(__dirname, '../fixtures/index.js'), new Date(), new Date());

  await setTimeout(1_000);

  const modifiedFilesLogMessage = messages.find((message) => {
    return message.message === 'building a webpack bundle' && message.context.modifiedFiles;
  });

  if (!modifiedFilesLogMessage) {
    throw new Error('log message not found');
  }

  t.true(Array.isArray(modifiedFilesLogMessage.context.modifiedFiles));
});
