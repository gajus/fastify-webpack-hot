import path from 'path';
import webpack from 'webpack';

export default {
  devtool: 'source-map',
  entry: path.resolve(__dirname, './client/client.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/u,
        test: /\.ts$/u,
        use: 'ts-loader',
      },
    ],
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'import.meta.webpackHot': 'import.meta.webpackHot',
    }),
  ],
  resolve: {
    extensions: [
      '.ts',
    ],
  },
};
