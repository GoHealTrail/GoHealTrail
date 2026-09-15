const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const globals = require('globals')

module.exports = [
  {
    ignores: ['eslint.config.js', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
]
