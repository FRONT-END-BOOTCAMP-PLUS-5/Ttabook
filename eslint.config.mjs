import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
]

export default defineConfig([
  eslintConfig,
  eslintConfigPrettier,
]);
