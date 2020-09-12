"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _default = (0, _utils.createRule)({
  name: __filename,
  meta: {
    docs: {
      description: 'Prevent calling `expect` conditionally',
      category: 'Best Practices',
      recommended: 'error'
    },
    messages: {
      conditionalExpect: 'Avoid calling `expect` conditionally`'
    },
    type: 'problem',
    schema: []
  },
  defaultOptions: [],

  create(context) {
    let conditionalDepth = 0;
    let inTestCase = false;

    const increaseConditionalDepth = () => inTestCase && conditionalDepth++;

    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--;

    return {
      FunctionDeclaration(node) {
        const declaredVariables = context.getDeclaredVariables(node);
        const testCallExpressions = (0, _utils.getTestCallExpressionsFromDeclaredVariables)(declaredVariables);

        if (testCallExpressions.length > 0) {
          inTestCase = true;
        }
      },

      CallExpression(node) {
        if ((0, _utils.isTestCase)(node)) {
          inTestCase = true;
        }

        if (inTestCase && (0, _utils.isExpectCall)(node) && conditionalDepth > 0) {
          context.report({
            messageId: 'conditionalExpect',
            node
          });
        }
      },

      'CallExpression:exit'(node) {
        if ((0, _utils.isTestCase)(node)) {
          inTestCase = false;
        }
      },

      CatchClause: increaseConditionalDepth,
      'CatchClause:exit': decreaseConditionalDepth,
      IfStatement: increaseConditionalDepth,
      'IfStatement:exit': decreaseConditionalDepth,
      SwitchStatement: increaseConditionalDepth,
      'SwitchStatement:exit': decreaseConditionalDepth,
      ConditionalExpression: increaseConditionalDepth,
      'ConditionalExpression:exit': decreaseConditionalDepth,
      LogicalExpression: increaseConditionalDepth,
      'LogicalExpression:exit': decreaseConditionalDepth
    };
  }

});

exports.default = _default;