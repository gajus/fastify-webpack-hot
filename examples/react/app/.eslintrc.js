module.exports = {
  overrides: [
    {
      extends: [
        'canonical',
        'canonical/node',
      ],
      files: '*.js',
    },
    {
      extends: [
        'canonical',
        'canonical/typescript',
        'canonical/react',
      ],
      files: '*.tsx',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
  root: true,
};
