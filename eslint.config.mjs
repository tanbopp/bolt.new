import blitzPlugin from '@blitz/eslint-plugin';
import { jsFileExtensions } from '@blitz/eslint-plugin/dist/configs/javascript.js';
import { getNamingConventionRule, tsFileExtensions } from '@blitz/eslint-plugin/dist/configs/typescript.js';

export default [
  {
    /**
     * `build/`, `test-results/`, dan `playwright-report/` adalah artefak hasil
     * build/test (sudah ada di `.gitignore`) — tanpa di-ignore, ESLint ikut
     * memindai bundel hasil build dan menjadi sangat lambat.
     */
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.wrangler',
      '**/bolt/build',
      'build/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
    ],
  },
  ...blitzPlugin.configs.recommended(),
  {
    rules: {
      '@blitz/catch-error-name': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      ...getNamingConventionRule({}, true),
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: [...tsFileExtensions, ...jsFileExtensions, '**/*.tsx'],

    /**
     * `tests/**` dikecualikan: alias `~/` hanya berlaku untuk folder `app/`
     * (lihat `tsconfig.json`), sedangkan Playwright tidak menjalankan resolver
     * path tsconfig, jadi test E2E wajib memakai import relatif.
     */
    ignores: ['functions/*', 'tests/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../'],
              message: `Relative imports are not allowed. Please use '~/' instead.`,
            },
          ],
        },
      ],
    },
  },
];
