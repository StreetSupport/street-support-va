// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', '*.js', 'eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Phase 1: promoted from warn to error
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-useless-escape': 'error',

      // Phase 1: new simple rules
      'no-case-declarations': 'off',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-fallthrough': 'error',

      // Phase 2: type-aware rules (catches untyped data flowing through)
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Prevent || when ?? is intended (catches choice || 1 pitfalls)
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',

      // Catches floating promises (missed await)
      '@typescript-eslint/no-floating-promises': 'warn',

      // Catches unnecessary type assertions
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },
);
