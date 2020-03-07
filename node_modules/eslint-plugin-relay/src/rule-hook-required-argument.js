/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const utils = require('./utils');
const shouldLint = utils.shouldLint;

function reportMissingKeyArgument(node, context, hookName) {
  context.report({
    node: node,
    message: `A fragment reference should be passed to the \`${hookName}\` hook`
  });
}

module.exports = {
  meta: {
    docs: {
      description:
        'Validates that the second argument is passed to relay hooks.'
    }
  },
  create(context) {
    if (!shouldLint(context)) {
      return {};
    }

    return {
      'CallExpression[callee.name=useFragment][arguments.length < 2]'(node) {
        reportMissingKeyArgument(node, context, 'useFragment');
      },
      'CallExpression[callee.name=usePaginationFragment][arguments.length < 2]'(
        node
      ) {
        reportMissingKeyArgument(node, context, 'usePaginationFragment');
      },

      'CallExpression[callee.name=useBlockingPaginationFragment][arguments.length < 2]'(
        node
      ) {
        reportMissingKeyArgument(
          node,
          context,
          'useBlockingPaginationFragment'
        );
      },

      'CallExpression[callee.name=useLegacyPaginationFragment][arguments.length < 2]'(
        node
      ) {
        reportMissingKeyArgument(node, context, 'useLegacyPaginationFragment');
      },

      'CallExpression[callee.name=useRefetchableFragment][arguments.length < 2]'(
        node
      ) {
        reportMissingKeyArgument(node, context, 'useRefetchableFragment');
      }
    };
  }
};
