"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _experimentalUtils = require("@typescript-eslint/experimental-utils");

var _utils = require("./utils");

const findCallbackArg = node => {
  if ((0, _utils.isHook)(node) && node.arguments.length >= 1) {
    return node.arguments[0];
  }

  if ((0, _utils.isTestCase)(node) && node.arguments.length >= 2) {
    return node.arguments[1];
  }

  return null;
};

var _default = (0, _utils.createRule)({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Avoid using a callback in asynchronous tests and hooks',
      recommended: 'error',
      suggestion: true
    },
    messages: {
      noDoneCallback: 'Return a Promise instead of relying on callback parameter',
      suggestWrappingInPromise: 'Wrap in `new Promise({{ callback }} => ...`',
      useAwaitInsteadOfCallback: 'Use await instead of callback in async functions'
    },
    schema: [],
    type: 'suggestion'
  },
  defaultOptions: [],

  create(context) {
    return {
      CallExpression(node) {
        const callback = findCallbackArg(node);

        if (!callback || !(0, _utils.isFunction)(callback) || callback.params.length !== 1) {
          return;
        }

        const [argument] = callback.params;

        if (argument.type !== _experimentalUtils.AST_NODE_TYPES.Identifier) {
          context.report({
            node: argument,
            messageId: 'noDoneCallback'
          });
          return;
        }

        if (callback.async) {
          context.report({
            node: argument,
            messageId: 'useAwaitInsteadOfCallback'
          });
          return;
        }

        context.report({
          node: argument,
          messageId: 'noDoneCallback',
          suggest: [{
            messageId: 'suggestWrappingInPromise',
            data: {
              callback: argument.name
            },

            fix(fixer) {
              const {
                body
              } = callback;
              const sourceCode = context.getSourceCode();
              const firstBodyToken = sourceCode.getFirstToken(body);
              const lastBodyToken = sourceCode.getLastToken(body);
              const tokenBeforeArgument = sourceCode.getTokenBefore(argument);
              const tokenAfterArgument = sourceCode.getTokenAfter(argument);
              /* istanbul ignore if */

              if (!firstBodyToken || !lastBodyToken || !tokenBeforeArgument || !tokenAfterArgument) {
                throw new Error(`Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`);
              }

              const argumentInParens = tokenBeforeArgument.value === '(' && tokenAfterArgument.value === ')';
              let argumentFix = fixer.replaceText(argument, '()');

              if (argumentInParens) {
                argumentFix = fixer.remove(argument);
              }

              let newCallback = argument.name;

              if (argumentInParens) {
                newCallback = `(${newCallback})`;
              }

              let beforeReplacement = `new Promise(${newCallback} => `;
              let afterReplacement = ')';
              let replaceBefore = true;

              if (body.type === _experimentalUtils.AST_NODE_TYPES.BlockStatement) {
                const keyword = 'return';
                beforeReplacement = `${keyword} ${beforeReplacement}{`;
                afterReplacement += '}';
                replaceBefore = false;
              }

              return [argumentFix, replaceBefore ? fixer.insertTextBefore(firstBodyToken, beforeReplacement) : fixer.insertTextAfter(firstBodyToken, beforeReplacement), fixer.insertTextAfter(lastBodyToken, afterReplacement)];
            }

          }]
        });
      }

    };
  }

});

exports.default = _default;