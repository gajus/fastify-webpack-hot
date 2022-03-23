# TypeScript, Fastify, Webpack HRM example

## Start

```bash
npm install
npm run start
```

The website is available at http://127.0.0.1:8080/

After the page has loaded, edit `app/hello.ts` to verify that HMR is working as expected.

For more context, refer to [Webpack Hot Module Replacement documentation](https://webpack.js.org/api/hot-module-replacement/).

## Setup

The example includes quite a few elements, however, in order to replicate the HMR behaviour, you only need to:

1. Add `HotModuleReplacementPlugin` Webpack plugin
1. Add `fastify-webpack-hot/client` Webpack entry script