const nextJest = require('next/jest');

// package.json already exposed a `test: jest` script but there was no config, so
// `npm test` could not parse a single TypeScript file. next/jest wires up the
// project's SWC transform and tsconfig path aliases (@/…) for us.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};

module.exports = createJestConfig(config);
