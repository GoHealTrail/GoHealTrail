const tsParser = require('@typescript-eslint/parser')

/**
 * Minimal flat ESLint config for the web app.
 * The original baseline used a parser-only config; ESLint 9 (flat) requires
 * this file instead of the legacy .eslintrc.json. Next.js core web vitals
 * rules are enforced at build time via next lint when needed.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
]

module.exports = config
