module.exports = {
  meta: {
    docs: {},
    schema: []
  },

  create(context) {
    var allJsClassNameRegexp = /\bjs-[_a-zA-Z0-9-]*/g
    var validJsClassNameRegexp = /^js(-[a-z0-9]+)+$/g
    var endWithJsClassNameRegexp = /\bjs-[_a-zA-Z0-9-]*$/g

    function checkStringFormat(node, str) {
      var matches = str.match(allJsClassNameRegexp) || []
      matches.forEach(function(match) {
        if (!match.match(validJsClassNameRegexp)) {
          context.report(node, 'js- class names should be lowercase and only contain dashes.')
        }
      })
    }

    function checkStringEndsWithJSClassName(node, str) {
      if (str.match(endWithJsClassNameRegexp)) {
        context.report(node, 'js- class names should be statically defined.')
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkStringFormat(node, node.value)

          if (
            node.parent &&
            node.parent.type === 'BinaryExpression' &&
            node.parent.operator === '+' &&
            node.parent.left.value
          ) {
            checkStringEndsWithJSClassName(node.parent.left, node.parent.left.value)
          }
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach(function(quasi) {
          checkStringFormat(quasi, quasi.value.raw)

          if (quasi.tail === false) {
            checkStringEndsWithJSClassName(quasi, quasi.value.raw)
          }
        })
      }
    }
  }
}
