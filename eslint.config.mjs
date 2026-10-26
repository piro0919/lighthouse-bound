import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import magicNumbers from '@piro0919/eslint-config';
import tailwind from '@piro0919/eslint-config/tailwind';
import hollowTests from 'eslint-plugin-hollow-tests';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  ...tailwind({
    cssConfigPath: 'src/app/globals.css',
    files: ['src/**/*.{ts,tsx}'],
    level: 'error',
  }),
  // ドット絵の点の表は数字そのものが絵なので外す
  ...magicNumbers({
    files: ['src/**/*.{ts,tsx}'],
    level: 'error',
    ignores: ['src/game/art/sprites.ts'],
  }),
  { ...hollowTests.configs.recommended, files: ['test/**/*.ts'] },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.claude/**']),
]);

export default eslintConfig;
