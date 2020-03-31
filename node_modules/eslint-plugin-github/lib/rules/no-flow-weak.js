module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    function handleComment(comment) {
      var value = comment.value.trim()
      if (value.match(/@flow weak/)) {
        context.report(comment, "Do not use Flow 'weak' mode checking, use @flow instead.")
      }
    }

    return {
      LineComment: handleComment,
      BlockComment: handleComment,
      Program() {
        const comments = context.getSourceCode().getAllComments()
        comments.forEach(handleComment)
      }
    }
  }
}
