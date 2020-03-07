/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');

const graphql = require('graphql');
const parse = graphql.parse;

function getGraphQLAST(taggedTemplateExpression) {
  if (!isGraphQLTag(taggedTemplateExpression.tag)) {
    return null;
  }
  if (taggedTemplateExpression.quasi.quasis.length !== 1) {
    // has substitutions, covered by graphql-syntax rule
    return null;
  }
  const quasi = taggedTemplateExpression.quasi.quasis[0];
  try {
    return parse(quasi.value.cooked);
  } catch (error) {
    // Invalid syntax, covered by graphql-syntax rule
    return null;
  }
}

/**
 * Returns a loc object for error reporting.
 */
function getLoc(context, templateNode, graphQLNode) {
  const startAndEnd = getRange(context, templateNode, graphQLNode);
  const start = startAndEnd[0];
  const end = startAndEnd[1];
  return {
    start: getLocFromIndex(context.getSourceCode(), start),
    end: getLocFromIndex(context.getSourceCode(), end)
  };
}

// TODO remove after we no longer have to support ESLint 3.5.0
function getLocFromIndex(sourceCode, index) {
  if (sourceCode.getSourceCode) {
    return sourceCode.getSourceCode(index);
  }
  let pos = 0;
  for (let line = 0; line < sourceCode.lines.length; line++) {
    const lineLength = sourceCode.lines[line].length;
    if (index <= pos + lineLength) {
      return {line: line + 1, column: index - pos};
    }
    pos += lineLength + 1;
  }
  return null;
}

// Copied directly from Relay
function getModuleName(filePath) {
  // index.js -> index
  // index.js.flow -> index.js
  let filename = path.basename(filePath, path.extname(filePath));

  // index.js -> index (when extension has multiple segments)
  // index.react -> index (when extension has multiple segments)
  filename = filename.replace(/(\.(?!ios|android)[_a-zA-Z0-9\\-]+)+/g, '');

  // /path/to/button/index.js -> button
  let moduleName =
    filename === 'index' ? path.basename(path.dirname(filePath)) : filename;

  // foo-bar -> fooBar
  // Relay compatibility mode splits on _, so we can't use that here.
  moduleName = moduleName.replace(/[^a-zA-Z0-9]+(\w?)/g, (match, next) =>
    next.toUpperCase()
  );

  return moduleName;
}

/**
 * Returns a range object for auto fixers.
 */
function getRange(context, templateNode, graphQLNode) {
  const graphQLStart = templateNode.quasi.quasis[0].start;
  return [
    graphQLStart + graphQLNode.loc.start,
    graphQLStart + graphQLNode.loc.end
  ];
}

function isGraphQLTag(tag) {
  return tag.type === 'Identifier' && tag.name === 'graphql';
}

function isGraphQLDeprecatedTag(tag) {
  return tag.type === 'Identifier' && tag.name === 'graphql_DEPRECATED';
}

function shouldLint(context) {
  return /graphql|relay/i.test(context.getSourceCode().text);
}

module.exports = {
  getGraphQLAST: getGraphQLAST,
  getLoc: getLoc,
  getLocFromIndex: getLocFromIndex,
  getModuleName: getModuleName,
  getRange: getRange,
  isGraphQLTag: isGraphQLTag,
  isGraphQLDeprecatedTag: isGraphQLDeprecatedTag,
  shouldLint: shouldLint
};
