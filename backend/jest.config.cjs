/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use preset for TypeScript + ESM support
  preset: 'ts-jest/presets/js-with-ts-esm',

  testEnvironment: 'node',

  testMatch: ['**/*.test.ts'],

  moduleFileExtensions: ['ts', 'js'],

  extensionsToTreatAsEsm: ['.ts'],

  coverageDirectory: './coverage',

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/config/app.bootstrap.ts'
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  watchPathIgnorePatterns: ['<rootDir>/node_modules/']
};
