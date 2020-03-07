/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const utils = require('./utils');
const getGraphQLAST = utils.getGraphQLAST;
const getLoc = utils.getLoc;
const getModuleName = utils.getModuleName;
const getRange = utils.getRange;
const isGraphQLTag = utils.isGraphQLTag;
const isGraphQLDeprecatedTag = utils.isGraphQLDeprecatedTag;
const shouldLint = utils.shouldLint;

const CREATE_CONTAINER_FUNCTIONS = new Set([
  'createFragmentContainer',
  'createPaginationContainer',
  'createRefetchContainer'
]);

function isCreateContainerCall(node) {
  const callee = node.callee;
  // prettier-ignore
  return (
    callee.type === 'Identifier' &&
    CREATE_CONTAINER_FUNCTIONS.has(callee.name)
  ) || (
    callee.kind === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    // Relay, relay, RelayCompat, etc.
    /relay/i.test(callee.object.value) &&
    callee.property.type === 'Identifier' &&
    CREATE_CONTAINER_FUNCTIONS.has(callee.property.name)
  );
}

function calleeToString(callee) {
  if (callee.type) {
    return callee.name;
  }
  if (
    callee.kind === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.property.type === 'Identifier'
  ) {
    return callee.object.value + '.' + callee.property.name;
  }
  return null;
}

function validateTemplate(context, taggedTemplateExpression, keyName) {
  const ast = getGraphQLAST(taggedTemplateExpression);
  if (!ast) {
    return;
  }
  const moduleName = getModuleName(context.getFilename());
  ast.definitions.forEach(def => {
    if (!def.name) {
      // no name, covered by graphql-naming/TaggedTemplateExpression
      return;
    }
    const definitionName = def.name.value;
    if (def.kind === 'FragmentDefinition') {
      if (keyName) {
        const expectedName = moduleName + '_' + keyName;
        if (definitionName !== expectedName) {
          context.report({
            loc: getLoc(context, taggedTemplateExpression, def.name),
            message:
              'Container fragment names must be `<ModuleName>_<propName>`. ' +
              'Got `{{actual}}`, expected `{{expected}}`.',
            data: {
              actual: definitionName,
              expected: expectedName
            },
            fix: fixer =>
              fixer.replaceTextRange(
                getRange(context, taggedTemplateExpression, def.name),
                expectedName
              )
          });
        }
      }
    }
  });
}

module.exports = {
  meta: {
    fixable: 'code',
    docs: {
      description: 'Validates naming conventions of graphql tags'
    }
  },
  create(context) {
    if (!shouldLint(context)) {
      return {};
    }
    return {
      TaggedTemplateExpression(node) {
        const ast = getGraphQLAST(node);
        if (!ast) {
          return;
        }

        ast.definitions.forEach(definition => {
          switch (definition.kind) {
            case 'OperationDefinition': {
              const moduleName = getModuleName(context.getFilename());
              const name = definition.name;
              if (!name) {
                return;
              }
              const operationName = name.value;

              if (operationName.indexOf(moduleName) !== 0) {
                context.report({
                  message:
                    'Operations should start with the module name. ' +
                    'Expected prefix `{{expected}}`, got `{{actual}}`.',
                  data: {
                    expected: moduleName,
                    actual: operationName
                  },
                  loc: getLoc(context, node, name)
                });
              }
              break;
            }
            default:
          }
        });
      },
      CallExpression(node) {
        if (!isCreateContainerCall(node)) {
          return;
        }
        const fragments = node.arguments[1];
        if (fragments.type === 'ObjectExpression') {
          fragments.properties.forEach(property => {
            if (
              property.type === 'Property' &&
              property.key.type === 'Identifier' &&
              property.computed === false &&
              property.value.type === 'TaggedTemplateExpression'
            ) {
              if (
                !isGraphQLTag(property.value.tag) &&
                !isGraphQLDeprecatedTag(property.value.tag)
              ) {
                context.report({
                  node: property.value.tag,
                  message:
                    '`{{callee}}` expects GraphQL to be tagged with ' +
                    'graphql`...`.',
                  data: {
                    callee: calleeToString(node.callee)
                  }
                });
                return;
              }
              validateTemplate(context, property.value, property.key.name);
            } else {
              context.report({
                node: property,
                message:
                  '`{{callee}}` expects fragment definitions to be ' +
                  '`key: graphql`.',
                data: {
                  callee: calleeToString(node.callee)
                }
              });
            }
          });
        }
      }
    };
  }
};
