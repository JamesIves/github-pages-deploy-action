module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (node.property && node.property.name === 'dataset') {
          context.report(node, "Use getAttribute('data-your-attribute') instead of dataset.")
        }
      }
    }
  }
}
