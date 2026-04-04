// CJS stub for @actions/io (ESM-only in v3+).
// Provides working implementations using Node.js fs for integration tests.
// jest.mock('@actions/io', factory) calls in tests override this stub entirely.
const fs = require('fs')

module.exports = {
  mkdirP: async dir => fs.promises.mkdir(dir, {recursive: true}),
  rmRF: async inputPath =>
    fs.promises.rm(inputPath, {recursive: true, force: true})
}
