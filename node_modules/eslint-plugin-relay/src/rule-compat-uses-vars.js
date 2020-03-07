/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const utils = require('./utils');
const shouldLint = utils.shouldLint;
const getGraphQLAST = utils.getGraphQLAST;
const getModuleName = utils.getModuleName;
const getLoc = utils.getLoc;

const graphql = require('graphql');
const visit = graphql.visit;

function validateInlineDirective(spreadNode) {
  return !!spreadNode.directives
    .filter(directive => directive.name.value === 'relay')
    .find(
      directive =>
        !!directive.arguments.find(argument => argument.name.value === 'mask')
    );
}

module.exports = {
  meta: {
    docs: {
      description:
        'Relay Compat transforms fragment spreads from ' +
        "`...Container_foo` to `Container.getFragment('foo')`. This " +
        'makes ESLint aware of this.'
    }
  },
  create(context) {
    if (!shouldLint(context)) {
      return {};
    }
    if (!/react-relay\/compat|RelayCompat/.test(context.getSourceCode().text)) {
      // Only run in for compat mode files
      return {};
    }
    function isInScope(name) {
      var scope = context.getScope();
      var variables = scope.variables;

      while (scope.type !== 'global') {
        scope = scope.upper;
        variables = scope.variables.concat(variables);
      }
      if (scope.childScopes.length) {
        variables = scope.childScopes[0].variables.concat(variables);
        // Temporary fix for babel-eslint
        if (scope.childScopes[0].childScopes.length) {
          variables = scope.childScopes[0].childScopes[0].variables.concat(
            variables
          );
        }
      }

      for (var i = 0, len = variables.length; i < len; i++) {
        if (variables[i].name === name) {
          return true;
        }
      }
      return false;
    }

    return {
      TaggedTemplateExpression(taggedTemplateExpression) {
        const ast = getGraphQLAST(taggedTemplateExpression);
        if (!ast) {
          return;
        }
        visit(ast, {
          FragmentSpread(spreadNode) {
            const m =
              spreadNode.name &&
              spreadNode.name.value.match(/^([a-z0-9]+)_([a-z0-9_]+)/i);
            if (!m) {
              return;
            }
            const componentName = m[1];
            const propName = m[2];
            const loc = getLoc(
              context,
              taggedTemplateExpression,
              spreadNode.name
            );
            if (isInScope(componentName)) {
              // if this variable is defined, mark it as used
              context.markVariableAsUsed(componentName);
            } else if (componentName === getModuleName(context.getFilename())) {
              if (!validateInlineDirective(spreadNode)) {
                context.report({
                  message:
                    'It looks like you are trying to spread the locally defined fragment `{{fragmentName}}`. ' +
                    'In compat mode, Relay only supports that for `@relay(mask: false)` directive. ' +
                    'If you intend to do that, please add the directive to the fragment spread `{{fragmentName}}` ' +
                    'and make sure that it is bound to a local variable named `{{propName}}`.',
                  data: {
                    fragmentName: spreadNode.name.value,
                    propName: propName
                  },
                  loc: loc
                });
                return;
              }

              if (!isInScope(propName)) {
                context.report({
                  message:
                    'When you are unmasking the locally defined fragment spread `{{fragmentName}}`, please make sure ' +
                    'the fragment is bound to a variable named `{{propName}}`.',
                  data: {
                    fragmentName: spreadNode.name.value,
                    propName: propName
                  },
                  loc: loc
                });
              }
              context.markVariableAsUsed(propName);
            } else {
              // otherwise, yell about this needed to be defined
              context.report({
                message:
                  'In compat mode, Relay expects the component that has ' +
                  'the `{{fragmentName}}` fragment to be imported with ' +
                  'the variable name `{{varName}}`.',
                data: {
                  fragmentName: spreadNode.name.value,
                  varName: componentName
                },
                loc: loc
              });
            }
          }
        });
      }
    };
  }
};
