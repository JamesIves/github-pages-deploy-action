"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _experimentalUtils = require("@typescript-eslint/experimental-utils");

var _utils = require("./utils");

const hasStringAsFirstArgument = node => node.arguments[0] && (0, _utils.isStringNode)(node.arguments[0]);

const isJestFunctionWithLiteralArg = node => ((0, _utils.isTestCase)(node) || (0, _utils.isDescribe)(node)) && node.callee.type === _experimentalUtils.AST_NODE_TYPES.Identifier && hasStringAsFirstArgument(node);

const jestFunctionName = (node, allowedPrefixes) => {
  const description = (0, _utils.getStringValue)(node.arguments[0]);

  if (allowedPrefixes.some(name => description.startsWith(name))) {
    return null;
  }

  const firstCharacter = description.charAt(0);

  if (!firstCharacter || firstCharacter === firstCharacter.toLowerCase()) {
    return null;
  }

  return node.callee.name;
};

var _default = (0, _utils.createRule)({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce lowercase test names',
      category: 'Best Practices',
      recommended: false
    },
    fixable: 'code',
    messages: {
      unexpectedLowercase: '`{{ method }}`s should begin with lowercase'
    },
    schema: [{
      type: 'object',
      properties: {
        ignore: {
          type: 'array',
          items: {
            enum: [_utils.DescribeAlias.describe, _utils.TestCaseName.test, _utils.TestCaseName.it]
          },
          additionalItems: false
        },
        allowedPrefixes: {
          type: 'array',
          items: {
            type: 'string'
          },
          additionalItems: false
        },
        ignoreTopLevelDescribe: {
          type: 'boolean',
          default: false
        }
      },
      additionalProperties: false
    }]
  },
  defaultOptions: [{
    ignore: [],
    allowedPrefixes: [],
    ignoreTopLevelDescribe: false
  }],

  create(context, [{
    ignore = [],
    allowedPrefixes = [],
    ignoreTopLevelDescribe
  }]) {
    let numberOfDescribeBlocks = 0;
    return {
      CallExpression(node) {
        if (!isJestFunctionWithLiteralArg(node)) {
          return;
        }

        if ((0, _utils.isDescribe)(node)) {
          numberOfDescribeBlocks++;

          if (ignoreTopLevelDescribe && numberOfDescribeBlocks === 1) {
            return;
          }
        }

        const erroneousMethod = jestFunctionName(node, allowedPrefixes);

        if (erroneousMethod && !ignore.includes(node.callee.name)) {
          context.report({
            messageId: 'unexpectedLowercase',
            node: node.arguments[0],
            data: {
              method: erroneousMethod
            },

            fix(fixer) {
              const [firstArg] = node.arguments;
              const description = (0, _utils.getStringValue)(firstArg);
              const rangeIgnoringQuotes = [firstArg.range[0] + 1, firstArg.range[1] - 1];
              const newDescription = description.substring(0, 1).toLowerCase() + description.substring(1);
              return [fixer.replaceTextRange(rangeIgnoringQuotes, newDescription)];
            }

          });
        }
      },

      'CallExpression:exit'(node) {
        if ((0, _utils.isDescribe)(node)) {
          numberOfDescribeBlocks--;
        }
      }

    };
  }

});

exports.default = _default;