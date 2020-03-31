"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;
exports.LINEBREAK_MATCHER = LINEBREAK_MATCHER;
function isOptionalChainPunctuator(token) {
    return token.type === experimental_utils_1.AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
exports.isOptionalChainPunctuator = isOptionalChainPunctuator;
function isNotOptionalChainPunctuator(token) {
    return !isOptionalChainPunctuator(token);
}
exports.isNotOptionalChainPunctuator = isNotOptionalChainPunctuator;
function isNonNullAssertionPunctuator(token) {
    return token.type === experimental_utils_1.AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
exports.isNonNullAssertionPunctuator = isNonNullAssertionPunctuator;
function isNotNonNullAssertionPunctuator(token) {
    return !isNonNullAssertionPunctuator(token);
}
exports.isNotNonNullAssertionPunctuator = isNotNonNullAssertionPunctuator;
/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
function isOptionalOptionalChain(node) {
    return (node.type === experimental_utils_1.AST_NODE_TYPES.OptionalCallExpression &&
        // this flag means the call expression itself is option
        // i.e. it is foo.bar?.() and not foo?.bar()
        node.optional);
}
exports.isOptionalOptionalChain = isOptionalOptionalChain;
/**
 * Returns true if and only if the node represents logical OR
 */
function isLogicalOrOperator(node) {
    return (node.type === experimental_utils_1.AST_NODE_TYPES.LogicalExpression && node.operator === '||');
}
exports.isLogicalOrOperator = isLogicalOrOperator;
/**
 * Determines whether two adjacent tokens are on the same line
 */
function isTokenOnSameLine(left, right) {
    return left.loc.end.line === right.loc.start.line;
}
exports.isTokenOnSameLine = isTokenOnSameLine;
/**
 * Checks if a node is a type assertion:
 * ```
 * x as foo
 * <foo>x
 * ```
 */
function isTypeAssertion(node) {
    if (!node) {
        return false;
    }
    return (node.type === experimental_utils_1.AST_NODE_TYPES.TSAsExpression ||
        node.type === experimental_utils_1.AST_NODE_TYPES.TSTypeAssertion);
}
exports.isTypeAssertion = isTypeAssertion;
function isVariableDeclarator(node) {
    var _a;
    return ((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.VariableDeclarator;
}
exports.isVariableDeclarator = isVariableDeclarator;
function isFunction(node) {
    if (!node) {
        return false;
    }
    return [
        experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.FunctionDeclaration,
        experimental_utils_1.AST_NODE_TYPES.FunctionExpression,
    ].includes(node.type);
}
exports.isFunction = isFunction;
function isFunctionType(node) {
    if (!node) {
        return false;
    }
    return [
        experimental_utils_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
        experimental_utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
        experimental_utils_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.TSFunctionType,
        experimental_utils_1.AST_NODE_TYPES.TSMethodSignature,
    ].includes(node.type);
}
exports.isFunctionType = isFunctionType;
function isFunctionOrFunctionType(node) {
    return isFunction(node) || isFunctionType(node);
}
exports.isFunctionOrFunctionType = isFunctionOrFunctionType;
function isTSFunctionType(node) {
    var _a;
    return ((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.TSFunctionType;
}
exports.isTSFunctionType = isTSFunctionType;
function isClassOrTypeElement(node) {
    if (!node) {
        return false;
    }
    return [
        // ClassElement
        experimental_utils_1.AST_NODE_TYPES.ClassProperty,
        experimental_utils_1.AST_NODE_TYPES.FunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.MethodDefinition,
        experimental_utils_1.AST_NODE_TYPES.TSAbstractClassProperty,
        experimental_utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition,
        experimental_utils_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
        experimental_utils_1.AST_NODE_TYPES.TSIndexSignature,
        // TypeElement
        experimental_utils_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
        experimental_utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
        // AST_NODE_TYPES.TSIndexSignature,
        experimental_utils_1.AST_NODE_TYPES.TSMethodSignature,
        experimental_utils_1.AST_NODE_TYPES.TSPropertySignature,
    ].includes(node.type);
}
exports.isClassOrTypeElement = isClassOrTypeElement;
/**
 * Checks if a node is a constructor method.
 */
function isConstructor(node) {
    var _a;
    return (((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.MethodDefinition &&
        node.kind === 'constructor');
}
exports.isConstructor = isConstructor;
/**
 * Checks if a node is a setter method.
 */
function isSetter(node) {
    return (!!node &&
        (node.type === experimental_utils_1.AST_NODE_TYPES.MethodDefinition ||
            node.type === experimental_utils_1.AST_NODE_TYPES.Property) &&
        node.kind === 'set');
}
exports.isSetter = isSetter;
function isIdentifier(node) {
    var _a;
    return ((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.Identifier;
}
exports.isIdentifier = isIdentifier;
/**
 * Checks if a node represents an `await …` expression.
 */
function isAwaitExpression(node) {
    var _a;
    return ((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_NODE_TYPES.AwaitExpression;
}
exports.isAwaitExpression = isAwaitExpression;
/**
 * Checks if a possible token is the `await` keyword.
 */
function isAwaitKeyword(node) {
    var _a;
    return ((_a = node) === null || _a === void 0 ? void 0 : _a.type) === experimental_utils_1.AST_TOKEN_TYPES.Identifier && node.value === 'await';
}
exports.isAwaitKeyword = isAwaitKeyword;
//# sourceMappingURL=astUtils.js.map