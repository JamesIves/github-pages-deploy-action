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
exports.checkSyntaxError = checkSyntaxError;
const ts = __importStar(require("typescript"));
const check_modifiers_1 = require("./check-modifiers");
const node_utils_1 = require("./node-utils");
const SyntaxKind = ts.SyntaxKind;
function checkSyntaxError(tsNode) {
    (0, check_modifiers_1.checkModifiers)(tsNode);
    const node = tsNode;
    switch (node.kind) {
        case SyntaxKind.SwitchStatement:
            if (node.caseBlock.clauses.filter(switchCase => switchCase.kind === SyntaxKind.DefaultClause).length > 1) {
                throw (0, node_utils_1.createError)(node, "A 'default' clause cannot appear more than once in a 'switch' statement.");
            }
            break;
        case SyntaxKind.ThrowStatement:
            if (node.expression.end === node.expression.pos) {
                throw (0, node_utils_1.createError)(node, 'A throw statement must throw an expression.');
            }
            break;
        case SyntaxKind.CatchClause:
            if (node.variableDeclaration?.initializer) {
                throw (0, node_utils_1.createError)(node.variableDeclaration.initializer, 'Catch clause variable cannot have an initializer.');
            }
            break;
        case SyntaxKind.FunctionDeclaration: {
            const isDeclare = (0, node_utils_1.hasModifier)(SyntaxKind.DeclareKeyword, node);
            const isAsync = (0, node_utils_1.hasModifier)(SyntaxKind.AsyncKeyword, node);
            const isGenerator = !!node.asteriskToken;
            if (isDeclare) {
                if (node.body) {
                    throw (0, node_utils_1.createError)(node, 'An implementation cannot be declared in ambient contexts.');
                }
                else if (isAsync) {
                    throw (0, node_utils_1.createError)(node, "'async' modifier cannot be used in an ambient context.");
                }
                else if (isGenerator) {
                    throw (0, node_utils_1.createError)(node, 'Generators are not allowed in an ambient context.');
                }
            }
            else if (!node.body && isGenerator) {
                throw (0, node_utils_1.createError)(node, 'A function signature cannot be declared as a generator.');
            }
            break;
        }
        case SyntaxKind.VariableDeclaration: {
            const hasExclamationToken = !!node.exclamationToken;
            if (hasExclamationToken) {
                if (node.initializer) {
                    throw (0, node_utils_1.createError)(node, 'Declarations with initializers cannot also have definite assignment assertions.');
                }
                else if (node.name.kind !== SyntaxKind.Identifier || !node.type) {
                    throw (0, node_utils_1.createError)(node, 'Declarations with definite assignment assertions must also have type annotations.');
                }
            }
            if (node.parent.kind === SyntaxKind.VariableDeclarationList) {
                const variableDeclarationList = node.parent;
                const kind = (0, node_utils_1.getDeclarationKind)(variableDeclarationList);
                if ((variableDeclarationList.parent.kind === SyntaxKind.ForInStatement ||
                    variableDeclarationList.parent.kind === SyntaxKind.ForStatement) &&
                    (kind === 'using' || kind === 'await using')) {
                    if (!node.initializer) {
                        throw (0, node_utils_1.createError)(node, `'${kind}' declarations may not be initialized in for statement.`);
                    }
                    if (node.name.kind !== SyntaxKind.Identifier) {
                        throw (0, node_utils_1.createError)(node.name, `'${kind}' declarations may not have binding patterns.`);
                    }
                }
                if (variableDeclarationList.parent.kind === SyntaxKind.VariableStatement) {
                    const variableStatement = variableDeclarationList.parent;
                    if (kind === 'using' || kind === 'await using') {
                        if (!node.initializer) {
                            throw (0, node_utils_1.createError)(node, `'${kind}' declarations must be initialized.`);
                        }
                        if (node.name.kind !== SyntaxKind.Identifier) {
                            throw (0, node_utils_1.createError)(node.name, `'${kind}' declarations may not have binding patterns.`);
                        }
                    }
                    const hasDeclareKeyword = (0, node_utils_1.hasModifier)(SyntaxKind.DeclareKeyword, variableStatement);
                    // Definite assignment only allowed for non-declare let and var
                    if ((hasDeclareKeyword ||
                        ['await using', 'const', 'using'].includes(kind)) &&
                        hasExclamationToken) {
                        throw (0, node_utils_1.createError)(node, `A definite assignment assertion '!' is not permitted in this context.`);
                    }
                    if (hasDeclareKeyword &&
                        node.initializer &&
                        (['let', 'var'].includes(kind) || node.type)) {
                        throw (0, node_utils_1.createError)(node, `Initializers are not permitted in ambient contexts.`);
                    }
                    // Theoretically, only certain initializers are allowed for declare const,
                    // (TS1254: A 'const' initializer in an ambient context must be a string
                    // or numeric literal or literal enum reference.) but we just allow
                    // all expressions
                    // Note! No-declare does not mean the variable is not ambient, because
                    // it can be further nested in other declare contexts. Therefore we cannot
                    // check for const initializers.
                }
            }
            break;
        }
        case SyntaxKind.VariableStatement: {
            const declarations = node.declarationList.declarations;
            if (!declarations.length) {
                throw (0, node_utils_1.createError)(node, 'A variable declaration list must have at least one variable declarator.');
            }
            break;
        }
        case SyntaxKind.PropertyAssignment: {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const { exclamationToken, questionToken } = node;
            if (questionToken) {
                throw (0, node_utils_1.createError)(questionToken, 'A property assignment cannot have a question token.');
            }
            if (exclamationToken) {
                throw (0, node_utils_1.createError)(exclamationToken, 'A property assignment cannot have an exclamation token.');
            }
            break;
        }
        case SyntaxKind.ShorthandPropertyAssignment: {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const { exclamationToken, modifiers, questionToken } = node;
            if (modifiers) {
                throw (0, node_utils_1.createError)(modifiers[0], 'A shorthand property assignment cannot have modifiers.');
            }
            if (questionToken) {
                throw (0, node_utils_1.createError)(questionToken, 'A shorthand property assignment cannot have a question token.');
            }
            if (exclamationToken) {
                throw (0, node_utils_1.createError)(exclamationToken, 'A shorthand property assignment cannot have an exclamation token.');
            }
            break;
        }
        case SyntaxKind.PropertyDeclaration: {
            const isAbstract = (0, node_utils_1.hasModifier)(SyntaxKind.AbstractKeyword, node);
            if (isAbstract && node.initializer) {
                throw (0, node_utils_1.createError)(node.initializer, `Abstract property cannot have an initializer.`);
            }
            if (node.name.kind === SyntaxKind.StringLiteral &&
                node.name.text === 'constructor') {
                throw (0, node_utils_1.createError)(node.name, "Classes may not have a field named 'constructor'.");
            }
            break;
        }
        case SyntaxKind.TaggedTemplateExpression:
            if (node.tag.flags & ts.NodeFlags.OptionalChain) {
                throw (0, node_utils_1.createError)(node, 'Tagged template expressions are not permitted in an optional chain.');
            }
            break;
        case SyntaxKind.ClassDeclaration:
            if (!node.name &&
                (!(0, node_utils_1.hasModifier)(ts.SyntaxKind.ExportKeyword, node) ||
                    !(0, node_utils_1.hasModifier)(ts.SyntaxKind.DefaultKeyword, node))) {
                throw (0, node_utils_1.createError)(node, "A class declaration without the 'default' modifier must have a name.");
            }
            break;
        case SyntaxKind.BinaryExpression:
            if (node.operatorToken.kind !== SyntaxKind.InKeyword &&
                node.left.kind === SyntaxKind.PrivateIdentifier) {
                throw (0, node_utils_1.createError)(node.left, "Private identifiers cannot appear on the right-hand-side of an 'in' expression.");
            }
            else if (node.right.kind === SyntaxKind.PrivateIdentifier) {
                throw (0, node_utils_1.createError)(node.right, "Private identifiers are only allowed on the left-hand-side of an 'in' expression.");
            }
            break;
        case SyntaxKind.MappedType:
            if (node.members && node.members.length > 0) {
                throw (0, node_utils_1.createError)(node.members[0], 'A mapped type may not declare properties or methods.');
            }
            break;
        case SyntaxKind.PropertySignature: {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const { initializer } = node;
            if (initializer) {
                throw (0, node_utils_1.createError)(initializer, 'A property signature cannot have an initializer.');
            }
            break;
        }
        case SyntaxKind.FunctionType: {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const { modifiers } = node;
            if (modifiers) {
                throw (0, node_utils_1.createError)(modifiers[0], 'A function type cannot have modifiers.');
            }
            break;
        }
        case SyntaxKind.EnumMember: {
            const computed = node.name.kind === ts.SyntaxKind.ComputedPropertyName;
            if (computed) {
                throw (0, node_utils_1.createError)(node.name, 'Computed property names are not allowed in enums.');
            }
            if (node.name.kind === SyntaxKind.NumericLiteral ||
                node.name.kind === SyntaxKind.BigIntLiteral) {
                throw (0, node_utils_1.createError)(node.name, 'An enum member cannot have a numeric name.');
            }
            break;
        }
        case SyntaxKind.ExternalModuleReference:
            if (node.expression.kind !== SyntaxKind.StringLiteral) {
                throw (0, node_utils_1.createError)(node.expression, 'String literal expected.');
            }
            break;
        case SyntaxKind.PrefixUnaryExpression:
        case SyntaxKind.PostfixUnaryExpression: {
            const operator = (0, node_utils_1.getTextForTokenKind)(node.operator);
            /**
             * ESTree uses UpdateExpression for ++/--
             */
            if ((operator === '++' || operator === '--') &&
                !(0, node_utils_1.isValidAssignmentTarget)(node.operand)) {
                throw (0, node_utils_1.createError)(node.operand, 'Invalid left-hand side expression in unary operation');
            }
            break;
        }
        case SyntaxKind.ImportDeclaration:
            assertModuleSpecifier(node, false);
            break;
        case SyntaxKind.ExportDeclaration:
            assertModuleSpecifier(node, node.exportClause?.kind === SyntaxKind.NamedExports);
            break;
        case SyntaxKind.CallExpression:
            if (node.expression.kind === SyntaxKind.ImportKeyword &&
                node.arguments.length !== 1 &&
                node.arguments.length !== 2) {
                throw (0, node_utils_1.createError)(node.arguments.length > 1 ? node.arguments[2] : node, 'Dynamic import requires exactly one or two arguments.');
            }
            break;
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement: {
            checkForStatementDeclaration(node);
            break;
        }
        // No default
    }
}
function checkForStatementDeclaration(node) {
    const { initializer, kind } = node;
    const loop = kind === SyntaxKind.ForInStatement ? 'for...in' : 'for...of';
    if (ts.isVariableDeclarationList(initializer)) {
        if (initializer.declarations.length !== 1) {
            throw (0, node_utils_1.createError)(initializer, `Only a single variable declaration is allowed in a '${loop}' statement.`);
        }
        const declaration = initializer.declarations[0];
        if (declaration.initializer) {
            throw (0, node_utils_1.createError)(declaration, `The variable declaration of a '${loop}' statement cannot have an initializer.`);
        }
        else if (declaration.type) {
            throw (0, node_utils_1.createError)(declaration, `The variable declaration of a '${loop}' statement cannot have a type annotation.`);
        }
        if (kind === SyntaxKind.ForInStatement &&
            initializer.flags & ts.NodeFlags.Using) {
            throw (0, node_utils_1.createError)(initializer, "The left-hand side of a 'for...in' statement cannot be a 'using' declaration.");
        }
    }
    else if (!(0, node_utils_1.isValidAssignmentTarget)(initializer) &&
        initializer.kind !== SyntaxKind.ObjectLiteralExpression &&
        initializer.kind !== SyntaxKind.ArrayLiteralExpression) {
        throw (0, node_utils_1.createError)(initializer, `The left-hand side of a '${loop}' statement must be a variable or a property access.`);
    }
}
function assertModuleSpecifier(node, allowNull) {
    if (!allowNull && node.moduleSpecifier == null) {
        throw (0, node_utils_1.createError)(node, 'Module specifier must be a string literal.');
    }
    if (node.moduleSpecifier &&
        node.moduleSpecifier.kind !== SyntaxKind.StringLiteral) {
        throw (0, node_utils_1.createError)(node.moduleSpecifier, 'Module specifier must be a string literal.');
    }
}
