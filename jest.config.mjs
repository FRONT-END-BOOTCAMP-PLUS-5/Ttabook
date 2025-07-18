import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {},
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'app/providers/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    './lib/**/*.{js,ts}': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

export default createJestConfig(config);
