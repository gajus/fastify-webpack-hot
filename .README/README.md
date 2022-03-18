# fastify-webpack

[![Travis build status](http://img.shields.io/travis/gajus/fastify-webpack/master.svg?style=flat-square)](https://travis-ci.com/gajus/fastify-webpack)
[![Coveralls](https://img.shields.io/coveralls/gajus/fastify-webpack.svg?style=flat-square)](https://coveralls.io/github/gajus/fastify-webpack)
[![NPM version](http://img.shields.io/npm/v/fastify-webpack.svg?style=flat-square)](https://www.npmjs.org/package/fastify-webpack)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

A [Fastify](https://github.com/fastify/fastify) plugin for serving files emitted by [Webpack](https://github.com/webpack/webpack).

## Setup

```ts
import webpack from 'webpack';
import {
  fastifyWebpack,
} from 'fastify-webpack';

const compiler = webpack();

void app.register(fastifyWebpack, {
  compiler,
});
```

## Response Compression

This plugin is compatible with [`compression-webpack-plugin`](https://www.npmjs.com/package/compression-webpack-plugin), i.e. This plugin will serve compressed files if the following conditions are true:

* Your outputs include compressed file versions (either `.br` or `.gz`)
* Request includes a matching `accept-encoding` header

Example `compression-webpack-plugin` configuration:

```ts
new CompressionPlugin({
  algorithm: 'brotliCompress',
  deleteOriginalAssets: false,
  filename: '[path][base].br',
  compressionOptions: {
    level: zlib.constants.BROTLI_MIN_QUALITY,
  },
  minRatio: 0.8,
  test: /\.(js|css|html|svg)$/,
  threshold: 10_240,
})
```

Note: You may also try using `fastify-compress`, however, beware of the outstanding issue that may cause the server to crash ([fastify-compress#215](https://github.com/fastify/fastify-compress/issues/215)).

## Difference from webpack-dev-server

* Does not allow to override default HTTP methods (GET, HEAD).
* Does not allow to provide custom headers.
* Does not allow to create an index.
* Does not support [`serverSideRender`](https://github.com/webpack/webpack-dev-middleware#serversiderender)
* Does not support [`writeToDisk`](https://github.com/webpack/webpack-dev-middleware#writetodisk)
* Does not support [`MultiCompiler`](https://webpack.js.org/api/node/#multicompiler)
* Does not support [`Accept-Ranges`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges)

All of the above are relatively straightforward to implement, however, I didn't have a use-case for them. If you have a use-case, please raise a PR.

## Debugging

This project uses [`roarr`](https://www.npmjs.com/package/roarr) logger to output the program's state.

Export `ROARR_LOG=true` environment variable to enable log printing to `stdout`.

Use [`roarr-cli`](https://github.com/gajus/roarr-cli) program to pretty-print the logs.