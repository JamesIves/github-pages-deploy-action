const observerMap = {
  scroll: 'IntersectionObserver',
  resize: 'ResizeObserver'
}
module.exports = {
  meta: {
    docs: {},
    fixable: 'code'
  },

  create(context) {
    return {
      ['CallExpression[callee.property.name="addEventListener"]']: function(node) {
        const [name] = node.arguments
        if (name.type !== 'Literal') return
        if (!(name.value in observerMap)) return
        context.report({
          node,
          message: `Avoid using "${name.value}" event listener. Consider using ${observerMap[name.value]} instead`
        })
      }
    }
  }
}
