module.exports = {
  meta: {
    docs: {},
    fixable: 'code'
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (node.property && node.property.name === 'innerText') {
          context.report({
            meta: {
              fixable: 'code'
            },
            node: node.property,
            message: 'Prefer textContent to innerText',
            fix(fixer) {
              return fixer.replaceText(node.property, 'textContent')
            }
          })
        }
      }
    }
  }
}
