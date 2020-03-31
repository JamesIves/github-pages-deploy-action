module.exports = {
  meta: {
    docs: {}
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (node.property && node.property.name === 'then') {
          context.report(node.property, 'Prefer async/await to Promise.then()')
        } else if (node.property && node.property.name === 'catch') {
          context.report(node.property, 'Prefer async/await to Promise.catch()')
        }
      }
    }
  }
}
