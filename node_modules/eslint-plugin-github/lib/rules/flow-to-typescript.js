module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    return {
      Program(node) {
        const comments = context.getSourceCode().getAllComments()
        const enabledTypeChecker = comments.some(comment => comment.value.trim().match(/@ts-check|@flow/))
        if (!enabledTypeChecker) {
          context.report(node, 'File must be type checked by TypeScript or Flow.')
        }
      }
    }
  }
}
