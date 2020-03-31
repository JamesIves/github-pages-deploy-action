const readPkgUp = require('read-pkg-up')
const path = require('path')

const dependencyGraph = new Map()
exports.dependencyGraph = dependencyGraph

exports.entries = new Set()

const entryWhitelist = [/\/tests?\//, /\.test\.js$/, /\.config\.js$/]

exports.checkEntriesWhitelist = filename => {
  for (const re of entryWhitelist) {
    if (re.test(filename)) {
      exports.entries.add(filename)
    }
  }
}

const packageFile = readPkgUp.sync()

function recordPackageEntry(entry) {
  exports.entries.add(path.resolve(packageFile.path, '..', entry))
}

if (packageFile) {
  for (const key in packageFile.packageJson) {
    if (key === 'main') {
      recordPackageEntry(packageFile.packageJson.main)
    } else if (key === 'entries') {
      packageFile.packageJson.entries.forEach(recordPackageEntry)
    } else if (/-bundles$/.test(key)) {
      // github-asset-pipeline internal manifest format
      Object.keys(packageFile.packageJson[key]).forEach(recordPackageEntry)
    }
  }
}

function gatherImported() {
  const filenames = new Set()
  const identifiers = new Set()

  for (const {imports} of dependencyGraph.values()) {
    for (const [importedFilename, importedIdentifiers] of imports) {
      // require.resolve will expand any symlinks to their fully qualified
      // directories. We can use this (with the absolute path given in
      // importedFilename to quickly expand symlinks, which allows us to have
      // symlinks (aka workspaces) in node_modules, and not fail the lint.
      const fullyQualifiedImportedFilename = require.resolve(importedFilename)
      filenames.add(fullyQualifiedImportedFilename)

      for (const importedIdentifier of importedIdentifiers) {
        identifiers.add(`${fullyQualifiedImportedFilename}#${importedIdentifier}`)
      }
    }
  }

  return {filenames, identifiers}
}

let importedCache = null

exports.imported = function() {
  if (!importedCache) {
    importedCache = gatherImported()
  }
  return importedCache
}
