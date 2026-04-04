module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/__tests__/stubs/@actions/core.js',
    '^@actions/exec$': '<rootDir>/__tests__/stubs/@actions/exec.js',
    '^@actions/github$': '<rootDir>/__tests__/stubs/@actions/github.js',
    '^@actions/io$': '<rootDir>/__tests__/stubs/@actions/io.js'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  setupFiles: ['<rootDir>/__tests__/env.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts', '!src/constants.ts']
}
