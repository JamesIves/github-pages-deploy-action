module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  setupFiles: ["<rootDir>/__tests__/env.js"],
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts','!src/constants.ts']
}