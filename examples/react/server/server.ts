import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import fastify from 'fastify';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import webpack from 'webpack';
import {
  fastifyWebpackHot,
} from '../../../dist/src';

const main = async () => {
  const app = fastify();

  const compiler = webpack({
    devtool: 'source-map',
    entry: [
      // This would be `fastify-webpack-hot/client` in a regular application.
      path.resolve(__dirname, '../../../dist/client.js'),
      path.resolve(__dirname, '../app/index.tsx'),
    ],
    mode: 'development',
    module: {
      rules: [
        {
          exclude: /node_modules/u,
          test: /\.tsx?$/u,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                getCustomTransformers: () => {
                  return {
                    before: [
                      ReactRefreshTypeScript(),
                    ],
                  };
                },
                transpileOnly: true,
              },
            },
          ],
        },
      ],
    },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, '/dist'),
      publicPath: '/',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ],
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx',
      ],
    },
  });

  void app.register(fastifyWebpackHot, {
    compiler,
  });

  app.get('/', (request, reply) => {
    void reply
      .type('text/html')
      .send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
        <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
        <script defer="defer" src="/main.js"></script>
        </head>
        <body>
          <div id='app'></div>
        </body>
      </html>    
    `);
  });

  await app.listen(8_080);
};

void main();
