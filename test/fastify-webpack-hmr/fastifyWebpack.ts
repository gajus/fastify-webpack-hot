import path from 'path';
import test from 'ava';
import createFastify from 'fastify';
import got from 'got';
import webpack from 'webpack';
import {
  fastifyWebpack,
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

  void app.register(fastifyWebpack, {
    compiler,
  });

  const serverAddress = await app.listen(0);

  const response = await got(serverAddress + '/main.js', {
    resolveBodyOnly: true,
  });

  t.is(response, 'console.log("Hello, World");');
});
