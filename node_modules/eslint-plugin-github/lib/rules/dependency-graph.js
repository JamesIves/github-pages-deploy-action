const resolve = require('eslint-module-utils/resolve').default

const {dependencyGraph, checkEntriesWhitelist, entries} = require('../dependency-graph')

const STAR = '*'
const DEFAULT = 'default'

module.exports = {
  meta: {
    docs: {}
  },

  create(context) {
    const filename = context.getFilename()
    const sourceCode = context.getSourceCode()

    const imports = new Map()
    const exports = new Set()

    checkEntriesWhitelist(filename)

    function recordImport(importPath, symbol) {
      let symbols = imports.get(importPath)
      if (!symbols) {
        symbols = new Set()
        imports.set(importPath, symbols)
      }

      if (symbol) {
        symbols.add(symbol)
      }
    }

    function recordExport(symbol) {
      if (symbol) {
        exports.add(symbol)
      }
    }

    return {
      ImportDeclaration(node) {
        const resolvedPath = resolve(node.source.value, context)
        if (!resolvedPath) {
          return
        }

        recordImport(resolvedPath)

        node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            recordImport(resolvedPath, DEFAULT)
          } else if (specifier.type === 'ImportSpecifier') {
            recordImport(resolvedPath, specifier.imported.name)
          }
        })
      },
      ExportDefaultDeclaration() {
        recordExport(DEFAULT)
      },
      ExportNamedDeclaration(node) {
        if (node.declaration == null) return

        if (node.declaration.id != null) {
          recordExport(node.declaration.id.name)
        }

        if (node.declaration.declarations != null) {
          for (const declaration of node.declaration.declarations) {
            recordExport(declaration.id.name)
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length === 1) {
          const pathNode = node.arguments[0]
          if (pathNode.type === 'Literal' && typeof pathNode.value === 'string') {
            const resolvedPath =
              pathNode.type === 'Literal' && typeof pathNode.value === 'string' && resolve(pathNode.value, context)

            if (resolvedPath) {
              recordImport(resolvedPath, STAR)
            }
          }
        }
      },
      MemberExpression(node) {
        if (context.getScope().type !== 'module') {
          return
        }

        if (node.object.name === 'module' && node.property.name === 'exports') {
          recordExport(DEFAULT)
        }

        if (node.object.name === 'exports') {
          recordExport(node.property.name)
        }
      },
      Program() {
        const comments = sourceCode.getAllComments()
        if (comments.some(token => token.type === 'Shebang')) {
          entries.add(filename)
        }
      },
      'Program:exit': function() {
        dependencyGraph.set(filename, {imports, exports})
      }
    }
  }
}
