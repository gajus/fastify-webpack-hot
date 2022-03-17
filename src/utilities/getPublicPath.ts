import type {
  Stats,
} from 'webpack';

type PublicPath = {
  outputPath: string,
  publicPath: string,
};

export const getPublicPath = (stats: Stats): PublicPath => {
  const {
    compilation,
  } = stats;

  const outputPath = compilation.getPath(
    compilation.outputOptions.path || '',
  );

  const publicPath = compilation.outputOptions.publicPath ?
    compilation.getPath(compilation.outputOptions.publicPath) :
    '';

  return {
    outputPath,
    publicPath,
  };
};
