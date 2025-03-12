import eslint from '@eslint/js';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPrettier,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
];
