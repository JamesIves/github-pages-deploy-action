module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    // Map .js relative imports back to source .ts files for ts-jest
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {module: 'commonjs', moduleResolution: 'node'}
      }
    ]
  },
  verbose: true,
  setupFiles: ['<rootDir>/__tests__/env.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts', '!src/constants.ts']
}
