module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.property && node.callee.property.name === 'forEach') {
          context.report(node, 'Prefer for...of instead of Array.forEach')
        }
      }
    }
  }
}
