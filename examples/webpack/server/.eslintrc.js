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
      ],
      files: '*.ts',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
  root: true,
};
