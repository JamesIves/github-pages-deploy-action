module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.property &&
          node.callee.object.property.name === 'classList'
        ) {
          const invalidArgument = node.arguments.some(arg => {
            return arg.type === 'Literal' && arg.value === 'd-none'
          })
          if (invalidArgument) {
            context.report({
              node,
              message: 'Prefer hidden property to d-none class'
            })
          }
        }
      }
    }
  }
}
