module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    return {
      Program() {
        var scope = context.getScope()

        scope.variables.forEach(function(variable) {
          if (variable.writeable) {
            return
          }

          variable.defs.forEach(function(def) {
            if (
              def.type === 'FunctionName' ||
              def.type === 'ClassName' ||
              (def.type === 'Variable' && def.parent.kind === 'const') ||
              (def.type === 'Variable' && def.parent.kind === 'let')
            ) {
              context.report(def.node, 'Implicit global variable, assign as global property instead.')
            }
          })
        })
      }
    }
  }
}
