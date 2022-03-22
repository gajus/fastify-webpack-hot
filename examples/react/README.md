# TypeScript, Fastify, Webpack, React HRM example

## Start

```bash
npm install
npm run start
```

The website is available at http://127.0.0.1:8080/

After the page has loaded, edit `app/App.tsx` to verify that HMR is working as expected.

## Setup

The example includes quite a few elements, however, in order to replicate React compatible HMR, you only need to:

1. Add `HotModuleReplacementPlugin` Webpack plugin
1. Add `ReactRefreshWebpackPlugin` Webpack plugin
1. Add `ReactRefreshTypeScript` TypeScript transform
1. Add `fastify-webpack/client` Webpack entry script