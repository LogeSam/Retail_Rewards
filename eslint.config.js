import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import a11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['build', 'coverage']),
  js.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.js'],
    ...react.configs.flat['jsx-runtime'],
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'error',
    },
  },
  {
    files: ['**/*.js'],
    ...a11y.flatConfigs.recommended,
  },
  {
    files: ['**/*.js'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
    },
  },
  {
    files: ['jest.setup.cjs'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
    },
  },
  {
    files: ['src/tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error'] }],
    },
  },
])
