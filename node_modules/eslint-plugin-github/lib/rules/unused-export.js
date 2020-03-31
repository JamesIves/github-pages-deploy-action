const depGraph = require('../dependency-graph')

module.exports = {
  meta: {
    docs: {}
  },

  create(context) {
    const filename = context.getFilename()
    const {identifiers} = depGraph.imported()

    if (depGraph.entries.has(filename)) {
      return {}
    }

    if (identifiers.has(`${filename}#*`)) {
      return {}
    }

    return {
      ExportDefaultDeclaration(node) {
        if (!identifiers.has(`${filename}#default`)) {
          context.report(node, 'Export was not imported by any modules.')
        }
      },
      ExportNamedDeclaration(node) {
        if (node.declaration == null) return

        if (node.declaration.id != null) {
          if (!identifiers.has(`${filename}#${node.declaration.id.name}`)) {
            context.report(node, 'Export was not imported by any modules.')
          }
        }

        if (node.declaration.declarations != null) {
          for (const declaration of node.declaration.declarations) {
            if (!identifiers.has(`${filename}#${declaration.id.name}`)) {
              context.report(node, 'Export was not imported by any modules.')
            }
          }
        }
      },
      MemberExpression(node) {
        if (context.getScope().type !== 'module') {
          return
        }

        if (node.object.name === 'exports') {
          if (!identifiers.has(`${filename}#${node.property.name}`)) {
            context.report(node.parent, 'Export was not imported by any modules.')
          }
        }
      }
    }
  }
}
