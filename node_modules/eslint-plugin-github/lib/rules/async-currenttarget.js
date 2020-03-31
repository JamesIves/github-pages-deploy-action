module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    const scopeDidWait = new WeakSet()

    return {
      AwaitExpression() {
        scopeDidWait.add(context.getScope(), true)
      },
      MemberExpression(node) {
        if (node.property && node.property.name === 'currentTarget') {
          const scope = context.getScope()
          if (scope.block.async && scopeDidWait.has(scope)) {
            context.report(node, 'event.currentTarget inside an async function is error prone')
          }
        }
      }
    }
  }
}
