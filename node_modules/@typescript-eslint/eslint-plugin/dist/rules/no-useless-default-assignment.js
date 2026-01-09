"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'no-useless-default-assignment',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow default values that will never be used',
            recommended: 'strict',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        messages: {
            preferOptionalSyntax: 'Using `= undefined` to make a parameter optional adds unnecessary runtime logic. Use the `?` optional syntax instead.',
            uselessDefaultAssignment: 'Default value is useless because the {{ type }} is not optional.',
            uselessUndefined: 'Default value is useless because it is undefined. Optional {{ type }}s are already undefined by default.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function canBeUndefined(type) {
            if ((0, util_1.isTypeAnyType)(type) || (0, util_1.isTypeUnknownType)(type)) {
                return true;
            }
            return tsutils
                .unionConstituents(type)
                .some(part => (0, util_1.isTypeFlagSet)(part, ts.TypeFlags.Undefined));
        }
        function getArrayElementType(arrayType, elementIndex) {
            if (checker.isTupleType(arrayType)) {
                const tupleArgs = checker.getTypeArguments(arrayType);
                if (elementIndex < tupleArgs.length) {
                    return tupleArgs[elementIndex];
                }
            }
            return arrayType.getNumberIndexType() ?? null;
        }
        function checkAssignmentPattern(node) {
            if (node.right.type === utils_1.AST_NODE_TYPES.Identifier &&
                node.right.name === 'undefined') {
                const tsNode = services.esTreeNodeToTSNodeMap.get(node);
                if (ts.isParameter(tsNode) &&
                    tsNode.type &&
                    canBeUndefined(checker.getTypeFromTypeNode(tsNode.type))) {
                    reportPreferOptionalSyntax(node);
                    return;
                }
                const type = node.parent.type === utils_1.AST_NODE_TYPES.Property ||
                    node.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern
                    ? 'property'
                    : 'parameter';
                reportUselessUndefined(node, type);
                return;
            }
            const parent = node.parent;
            if (parent.type === utils_1.AST_NODE_TYPES.ArrowFunctionExpression ||
                parent.type === utils_1.AST_NODE_TYPES.FunctionExpression) {
                const paramIndex = parent.params.indexOf(node);
                if (paramIndex !== -1) {
                    const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
                    if (ts.isFunctionLike(tsFunc)) {
                        const contextualType = checker.getContextualType(tsFunc);
                        if (!contextualType) {
                            return;
                        }
                        const signatures = contextualType.getCallSignatures();
                        if (signatures.length === 0 ||
                            signatures[0].getDeclaration() === tsFunc) {
                            return;
                        }
                        const params = signatures[0].getParameters();
                        if (paramIndex < params.length) {
                            const paramSymbol = params[paramIndex];
                            if ((paramSymbol.flags & ts.SymbolFlags.Optional) === 0) {
                                const paramType = checker.getTypeOfSymbol(paramSymbol);
                                if (!canBeUndefined(paramType)) {
                                    reportUselessDefaultAssignment(node, 'parameter');
                                }
                            }
                        }
                    }
                }
                return;
            }
            if (parent.type === utils_1.AST_NODE_TYPES.Property) {
                const propertyType = getTypeOfProperty(parent);
                if (!propertyType) {
                    return;
                }
                if (!canBeUndefined(propertyType)) {
                    reportUselessDefaultAssignment(node, 'property');
                }
            }
            else if (parent.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                const sourceType = getSourceTypeForPattern(parent);
                if (!sourceType) {
                    return;
                }
                if (!checker.isTupleType(sourceType)) {
                    return;
                }
                const tupleArgs = checker.getTypeArguments(sourceType);
                const elementIndex = parent.elements.indexOf(node);
                if (elementIndex < 0 || elementIndex >= tupleArgs.length) {
                    return;
                }
                const elementType = tupleArgs[elementIndex];
                if (!canBeUndefined(elementType)) {
                    reportUselessDefaultAssignment(node, 'property');
                }
            }
        }
        function getTypeOfProperty(node) {
            const objectPattern = node.parent;
            const sourceType = getSourceTypeForPattern(objectPattern);
            if (!sourceType) {
                return null;
            }
            const propertyName = getPropertyName(node.key);
            if (!propertyName) {
                return null;
            }
            const symbol = sourceType.getProperty(propertyName);
            if (!symbol) {
                return null;
            }
            if (symbol.flags & ts.SymbolFlags.Optional &&
                hasConditionalInitializer(objectPattern)) {
                return null;
            }
            return checker.getTypeOfSymbol(symbol);
        }
        function hasConditionalInitializer(node) {
            const parent = node.parent;
            if (!parent) {
                return false;
            }
            if (parent.type === utils_1.AST_NODE_TYPES.VariableDeclarator && parent.init) {
                return (parent.init.type === utils_1.AST_NODE_TYPES.ConditionalExpression ||
                    parent.init.type === utils_1.AST_NODE_TYPES.LogicalExpression);
            }
            return hasConditionalInitializer(parent);
        }
        function getSourceTypeForPattern(pattern) {
            const parent = (0, util_1.nullThrows)(pattern.parent, util_1.NullThrowsReasons.MissingParent);
            if (parent.type === utils_1.AST_NODE_TYPES.VariableDeclarator && parent.init) {
                const tsNode = services.esTreeNodeToTSNodeMap.get(parent.init);
                return checker.getTypeAtLocation(tsNode);
            }
            if ((0, util_1.isFunction)(parent)) {
                const paramIndex = parent.params.indexOf(pattern);
                const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
                const signature = (0, util_1.nullThrows)(checker.getSignatureFromDeclaration(tsFunc), util_1.NullThrowsReasons.MissingToken('signature', 'function'));
                const params = signature.getParameters();
                return checker.getTypeOfSymbol(params[paramIndex]);
            }
            if (parent.type === utils_1.AST_NODE_TYPES.AssignmentPattern) {
                return getSourceTypeForPattern(parent);
            }
            if (parent.type === utils_1.AST_NODE_TYPES.Property) {
                return getTypeOfProperty(parent);
            }
            if (parent.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                const arrayType = getSourceTypeForPattern(parent);
                if (!arrayType) {
                    return null;
                }
                const elementIndex = parent.elements.indexOf(pattern);
                return getArrayElementType(arrayType, elementIndex);
            }
            return null;
        }
        function getPropertyName(key) {
            switch (key.type) {
                case utils_1.AST_NODE_TYPES.Identifier:
                    return key.name;
                case utils_1.AST_NODE_TYPES.Literal:
                    return String(key.value);
                default:
                    return null;
            }
        }
        function reportUselessDefaultAssignment(node, type) {
            context.report({
                node: node.right,
                messageId: 'uselessDefaultAssignment',
                data: { type },
                fix: fixer => removeDefault(fixer, node),
            });
        }
        function reportUselessUndefined(node, type) {
            context.report({
                node: node.right,
                messageId: 'uselessUndefined',
                data: { type },
                fix: fixer => removeDefault(fixer, node),
            });
        }
        function reportPreferOptionalSyntax(node) {
            context.report({
                node: node.right,
                messageId: 'preferOptionalSyntax',
                *fix(fixer) {
                    yield removeDefault(fixer, node);
                    const { left } = node;
                    if (left.type === utils_1.AST_NODE_TYPES.Identifier) {
                        yield fixer.insertTextAfterRange([left.range[0], left.range[0] + left.name.length], '?');
                    }
                },
            });
        }
        function removeDefault(fixer, node) {
            const start = node.left.range[1];
            const end = node.range[1];
            return fixer.removeRange([start, end]);
        }
        return {
            AssignmentPattern: checkAssignmentPattern,
        };
    },
});
