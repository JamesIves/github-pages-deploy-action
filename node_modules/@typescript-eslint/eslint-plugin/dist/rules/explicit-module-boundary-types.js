"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const util = __importStar(require("../util"));
const explicitReturnTypeUtils_1 = require("../util/explicitReturnTypeUtils");
exports.default = util.createRule({
    name: 'explicit-module-boundary-types',
    meta: {
        type: 'problem',
        docs: {
            description: "Require explicit return and argument types on exported functions' and classes' public class methods",
            category: 'Stylistic Issues',
            recommended: false,
        },
        messages: {
            missingReturnType: 'Missing return type on function.',
            missingArgType: "Argument '{{name}}' should be typed.",
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowTypedFunctionExpressions: {
                        type: 'boolean',
                    },
                    allowHigherOrderFunctions: {
                        type: 'boolean',
                    },
                    allowDirectConstAssertionInArrowFunctions: {
                        type: 'boolean',
                    },
                    allowedNames: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
            allowDirectConstAssertionInArrowFunctions: true,
            allowedNames: [],
        },
    ],
    create(context, [options]) {
        const sourceCode = context.getSourceCode();
        function isUnexported(node) {
            let isReturnedValue = false;
            while (node) {
                if (node.type === experimental_utils_1.AST_NODE_TYPES.ExportDefaultDeclaration ||
                    node.type === experimental_utils_1.AST_NODE_TYPES.ExportNamedDeclaration ||
                    node.type === experimental_utils_1.AST_NODE_TYPES.ExportSpecifier) {
                    return false;
                }
                if (node.type === experimental_utils_1.AST_NODE_TYPES.JSXExpressionContainer) {
                    return true;
                }
                if (node.type === experimental_utils_1.AST_NODE_TYPES.ReturnStatement) {
                    isReturnedValue = true;
                }
                if (node.type === experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression ||
                    node.type === experimental_utils_1.AST_NODE_TYPES.FunctionDeclaration ||
                    node.type === experimental_utils_1.AST_NODE_TYPES.FunctionExpression) {
                    isReturnedValue = false;
                }
                if (node.type === experimental_utils_1.AST_NODE_TYPES.BlockStatement && !isReturnedValue) {
                    return true;
                }
                node = node.parent;
            }
            return true;
        }
        function isArgumentUntyped(node) {
            return (!node.typeAnnotation ||
                node.typeAnnotation.typeAnnotation.type === experimental_utils_1.AST_NODE_TYPES.TSAnyKeyword);
        }
        /**
         * Checks if a function declaration/expression has a return type.
         */
        function checkArguments(node) {
            const paramIdentifiers = node.params.filter(util.isIdentifier);
            const untypedArgs = paramIdentifiers.filter(isArgumentUntyped);
            untypedArgs.forEach(untypedArg => context.report({
                node,
                messageId: 'missingArgType',
                data: {
                    name: untypedArg.name,
                },
            }));
        }
        /**
         * Checks if a function name is allowed and should not be checked.
         */
        function isAllowedName(node) {
            if (!node || !options.allowedNames || !options.allowedNames.length) {
                return false;
            }
            if (node.type === experimental_utils_1.AST_NODE_TYPES.VariableDeclarator) {
                return (node.id.type === experimental_utils_1.AST_NODE_TYPES.Identifier &&
                    options.allowedNames.includes(node.id.name));
            }
            else if (node.type === experimental_utils_1.AST_NODE_TYPES.MethodDefinition ||
                node.type === experimental_utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition) {
                if (node.key.type === experimental_utils_1.AST_NODE_TYPES.Literal &&
                    typeof node.key.value === 'string') {
                    return options.allowedNames.includes(node.key.value);
                }
                if (node.key.type === experimental_utils_1.AST_NODE_TYPES.TemplateLiteral &&
                    node.key.expressions.length === 0) {
                    return options.allowedNames.includes(node.key.quasis[0].value.raw);
                }
                if (!node.computed && node.key.type === experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    return options.allowedNames.includes(node.key.name);
                }
            }
            return false;
        }
        return {
            'ArrowFunctionExpression, FunctionExpression'(node) {
                var _a;
                if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.MethodDefinition &&
                    node.parent.accessibility === 'private') {
                    // don't check private methods as they aren't part of the public signature
                    return;
                }
                if (isAllowedName(node.parent) ||
                    isUnexported(node) ||
                    explicitReturnTypeUtils_1.isTypedFunctionExpression(node, options)) {
                    return;
                }
                explicitReturnTypeUtils_1.checkFunctionExpressionReturnType(node, options, sourceCode, loc => context.report({
                    node,
                    loc,
                    messageId: 'missingReturnType',
                }));
                checkArguments(node);
            },
            FunctionDeclaration(node) {
                if (isAllowedName(node.parent) || isUnexported(node)) {
                    return;
                }
                explicitReturnTypeUtils_1.checkFunctionReturnType(node, options, sourceCode, loc => context.report({
                    node,
                    loc,
                    messageId: 'missingReturnType',
                }));
                checkArguments(node);
            },
        };
    },
});
//# sourceMappingURL=explicit-module-boundary-types.js.map