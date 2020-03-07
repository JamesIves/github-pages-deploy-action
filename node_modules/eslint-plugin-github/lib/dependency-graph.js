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

const packageJSON = readPkgUp.sync()

function recordPackageEntry(entry) {
  exports.entries.add(path.resolve(packageJSON.path, '..', entry))
}

if (packageJSON) {
  for (const key in packageJSON.pkg) {
    if (key === 'main') {
      recordPackageEntry(packageJSON.pkg.main)
    } else if (key === 'entries') {
      packageJSON.pkg.entries.forEach(recordPackageEntry)
    } else if (/-bundles$/.test(key)) {
      // github-asset-pipeline internal manifest format
      Object.keys(packageJSON.pkg[key]).forEach(recordPackageEntry)
    }
  }
}

function gatherImported() {
  const filenames = new Set()
  const identifiers = new Set()

  for (const {imports} of dependencyGraph.values()) {
    for (const [importedFilename, importedIdentifiers] of imports) {
      filenames.add(importedFilename)

      for (const importedIdentifier of importedIdentifiers) {
        identifiers.add(`${importedFilename}#${importedIdentifier}`)
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
