const path = require('path');
const fs = require('fs');
const glob = require('glob');

const rules = {
  'import/prefer-default-export': 0,
  'import/no-dynamic-require': 0,
  'global-require': 0,
};

const webRules = {
  'react/react-in-jsx-scope': 0,
  'react/jsx-props-no-spreading': 0,
  'react/no-unused-prop-types': 0,
};

const prismaRules = {
  'arrow-parens': 0,
  '@typescript-eslint/no-unused-vars': 0,
  'class-methods-use-this': 0,
  'max-classes-per-file': 0,
};

const tsConfigs = glob.sync('**/tsconfig.json')
  .filter((config) => fs.existsSync(
    path.resolve(
      path.dirname(
        path.resolve(config),
      ),
      'package.json',
    ),
  ))
  .map((config) => path.relative(__dirname, config));

if (process.env.DEBUG) {
  // eslint-disable-next-line no-console
  console.log(tsConfigs);
}

module.exports = {
  extends: 'airbnb',
  env: {
    browser: true,
    es6: true,
  },
  rules,
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: 'airbnb-typescript',
      parserOptions: {
        project: tsConfigs,
        tsconfigRootDir: __dirname,
      },
      rules: {
        ...rules,
        '@typescript-eslint/indent': ['error', 2, {
          ignoredNodes: ['TSTypeParameterInstantiation'],
        }],
      },
    },
    {
      files: ['packages/log/src/**/*'],
      rules: {
        'no-console': [0],
      },
    },
    {
      files: ['packages/app/src/**/*'],
      rules: {
        ...webRules,
      },
    },
    {
      files: ['packages/prisma/src/server/**/*'],
      rules: {
        ...prismaRules,
      },
    },
  ],
};
