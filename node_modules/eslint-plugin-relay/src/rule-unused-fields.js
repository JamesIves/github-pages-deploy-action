/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const utils = require('./utils');

const getGraphQLAST = utils.getGraphQLAST;

function getGraphQLFieldNames(graphQLAst) {
  const fieldNames = {};

  function walkAST(node, ignoreLevel) {
    if (node.kind === 'Field' && !ignoreLevel) {
      const nameNode = node.alias || node.name;
      fieldNames[nameNode.value] = nameNode;
    }
    if (node.kind === 'OperationDefinition') {
      if (node.operation === 'mutation' || node.operation === 'subscription') {
        return;
      }
      // Ignore fields that are direct children of query as used in mutation
      // or query definitions.
      node.selectionSet.selections.forEach(selection => {
        walkAST(selection, true);
      });
      return;
    }
    for (const prop in node) {
      const value = node[prop];
      if (prop === 'loc') {
        continue;
      }
      if (value && typeof value === 'object') {
        walkAST(value);
      } else if (Array.isArray(value)) {
        value.forEach(child => {
          walkAST(child);
        });
      }
    }
  }

  walkAST(graphQLAst);
  return fieldNames;
}

function isGraphQLTemplate(node) {
  return (
    node.tag.type === 'Identifier' &&
    node.tag.name === 'graphql' &&
    node.quasi.quasis.length === 1
  );
}

function isStringNode(node) {
  return (
    node != null && node.type === 'Literal' && typeof node.value === 'string'
  );
}

function isPageInfoField(field) {
  switch (field) {
    case 'pageInfo':
    case 'page_info':
    case 'hasNextPage':
    case 'has_next_page':
    case 'hasPreviousPage':
    case 'has_previous_page':
    case 'startCursor':
    case 'start_cursor':
    case 'endCursor':
    case 'end_cursor':
      return true;
    default:
      return false;
  }
}

function rule(context) {
  let currentMethod = [];
  let foundMemberAccesses = {};
  let templateLiterals = [];

  function visitGetByPathCall(node) {
    // The `getByPath` utility accesses nested fields in the form
    // `getByPath(thing, ['field', 'nestedField'])`.
    const pathArg = node.arguments[1];
    if (!pathArg || pathArg.type !== 'ArrayExpression') {
      return;
    }
    pathArg.elements.forEach(element => {
      if (isStringNode(element)) {
        foundMemberAccesses[element.value] = true;
      }
    });
  }

  function visitDotAccessCall(node) {
    // The `dotAccess` utility accesses nested fields in the form
    // `dotAccess(thing, 'field.nestedField')`.
    const pathArg = node.arguments[1];
    if (isStringNode(pathArg)) {
      pathArg.value.split('.').forEach(element => {
        foundMemberAccesses[element] = true;
      });
    }
  }

  function visitMemberExpression(node) {
    if (node.property.type === 'Identifier') {
      foundMemberAccesses[node.property.name] = true;
    }
  }

  return {
    Program(_node) {
      currentMethod = [];
      foundMemberAccesses = {};
      templateLiterals = [];
    },
    'Program:exit'(_node) {
      templateLiterals.forEach(templateLiteral => {
        const graphQLAst = getGraphQLAST(templateLiteral);
        if (!graphQLAst) {
          // ignore nodes with syntax errors, they're handled by rule-graphql-syntax
          return;
        }

        const queriedFields = getGraphQLFieldNames(graphQLAst);
        for (const field in queriedFields) {
          if (
            !foundMemberAccesses[field] &&
            !isPageInfoField(field) &&
            // Do not warn for unused __typename which can be a workaround
            // when only interested in existence of an object.
            field !== '__typename'
          ) {
            context.report({
              node: templateLiteral,
              loc: utils.getLoc(context, templateLiteral, queriedFields[field]),
              message:
                `This queries for the field \`${field}\` but this file does ` +
                'not seem to use it directly. If a different file needs this ' +
                'information that file should export a fragment and colocate ' +
                'the query for the data with the usage.\n' +
                'If only interested in the existence of a record, __typename ' +
                'can be used without this warning.'
            });
          }
        }
      });
    },
    CallExpression(node) {
      if (node.callee.type !== 'Identifier') {
        return;
      }
      switch (node.callee.name) {
        case 'getByPath':
          visitGetByPathCall(node);
          break;
        case 'dotAccess':
          visitDotAccessCall(node);
          break;
      }
    },
    TaggedTemplateExpression(node) {
      if (currentMethod[0] === 'getConfigs') {
        return;
      }
      if (isGraphQLTemplate(node)) {
        templateLiterals.push(node);
      }
    },
    MemberExpression: visitMemberExpression,
    OptionalMemberExpression: visitMemberExpression,
    ObjectPattern(node) {
      node.properties.forEach(node => {
        if (node.type === 'Property' && !node.computed) {
          foundMemberAccesses[node.key.name] = true;
        }
      });
    },
    MethodDefinition(node) {
      currentMethod.unshift(node.key.name);
    },
    'MethodDefinition:exit'(_node) {
      currentMethod.shift();
    }
  };
}

module.exports = rule;
