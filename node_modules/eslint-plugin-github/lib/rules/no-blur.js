module.exports = function(context) {
  return {
    CallExpression(node) {
      if (node.callee.property && node.callee.property.name === 'blur') {
        context.report(node, 'Do not use element.blur(), instead restore the focus of a previous element.')
      }
    }
  }
}

module.exports.schema = []
