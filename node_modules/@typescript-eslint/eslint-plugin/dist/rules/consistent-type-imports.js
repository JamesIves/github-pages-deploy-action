"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const util = __importStar(require("../util"));
function isImportToken(token) {
    return token.type === experimental_utils_1.AST_TOKEN_TYPES.Keyword && token.value === 'import';
}
function isTypeToken(token) {
    return token.type === experimental_utils_1.AST_TOKEN_TYPES.Identifier && token.value === 'type';
}
exports.default = util.createRule({
    name: 'consistent-type-imports',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforces consistent usage of type imports',
            category: 'Stylistic Issues',
            recommended: false,
        },
        messages: {
            typeOverValue: 'All imports in the declaration are only used as types. Use `import type`',
            someImportsAreOnlyTypes: 'Imports {{typeImports}} are only used as types',
            aImportIsOnlyTypes: 'Import {{typeImports}} is only used as types',
            valueOverType: 'Use an `import` instead of an `import type`.',
            noImportTypeAnnotations: '`import()` type annotations are forbidden.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    prefer: {
                        enum: ['type-imports', 'no-type-imports'],
                    },
                    disallowTypeAnnotations: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        fixable: 'code',
    },
    defaultOptions: [
        {
            prefer: 'type-imports',
            disallowTypeAnnotations: true,
        },
    ],
    create(context, [option]) {
        var _a;
        const prefer = (_a = option.prefer) !== null && _a !== void 0 ? _a : 'type-imports';
        const disallowTypeAnnotations = option.disallowTypeAnnotations !== false;
        const sourceCode = context.getSourceCode();
        const sourceImportsMap = {};
        return Object.assign(Object.assign({}, (prefer === 'type-imports'
            ? {
                // prefer type imports
                ImportDeclaration(node) {
                    var _a;
                    const source = node.source.value;
                    const sourceImports = (_a = sourceImportsMap[source]) !== null && _a !== void 0 ? _a : (sourceImportsMap[source] = {
                        source,
                        reportValueImports: [],
                        typeOnlyNamedImport: null,
                    });
                    if (node.importKind === 'type') {
                        if (!sourceImports.typeOnlyNamedImport &&
                            node.specifiers.every(specifier => specifier.type === experimental_utils_1.AST_NODE_TYPES.ImportSpecifier)) {
                            sourceImports.typeOnlyNamedImport = node;
                        }
                        return;
                    }
                    // if importKind === 'value'
                    const typeSpecifiers = [];
                    const valueSpecifiers = [];
                    const unusedSpecifiers = [];
                    for (const specifier of node.specifiers) {
                        const [variable] = context.getDeclaredVariables(specifier);
                        if (variable.references.length === 0) {
                            unusedSpecifiers.push(specifier);
                        }
                        else {
                            const onlyHasTypeReferences = variable.references.every(ref => {
                                if (ref.isValueReference) {
                                    // `type T = typeof foo` will create a value reference because "foo" must be a value type
                                    // however this value reference is safe to use with type-only imports
                                    let parent = ref.identifier.parent;
                                    while (parent) {
                                        if (parent.type === experimental_utils_1.AST_NODE_TYPES.TSTypeQuery) {
                                            return true;
                                        }
                                        // TSTypeQuery must have a TSESTree.EntityName as its child, so we can filter here and break early
                                        if (parent.type !== experimental_utils_1.AST_NODE_TYPES.TSQualifiedName) {
                                            break;
                                        }
                                        parent = parent.parent;
                                    }
                                    return false;
                                }
                                return ref.isTypeReference;
                            });
                            if (onlyHasTypeReferences) {
                                typeSpecifiers.push(specifier);
                            }
                            else {
                                valueSpecifiers.push(specifier);
                            }
                        }
                    }
                    if (typeSpecifiers.length) {
                        sourceImports.reportValueImports.push({
                            node,
                            typeSpecifiers,
                            valueSpecifiers,
                            unusedSpecifiers,
                        });
                    }
                },
                'Program:exit'() {
                    for (const sourceImports of Object.values(sourceImportsMap)) {
                        if (sourceImports.reportValueImports.length === 0) {
                            continue;
                        }
                        for (const report of sourceImports.reportValueImports) {
                            if (report.valueSpecifiers.length === 0 &&
                                report.unusedSpecifiers.length === 0) {
                                // import is all type-only, convert the entire import to `import type`
                                context.report({
                                    node: report.node,
                                    messageId: 'typeOverValue',
                                    *fix(fixer) {
                                        yield* fixToTypeImport(fixer, report, sourceImports);
                                    },
                                });
                            }
                            else {
                                // we have a mixed type/value import, so we need to split them out into multiple exports
                                const typeImportNames = report.typeSpecifiers.map(specifier => `"${specifier.local.name}"`);
                                context.report({
                                    node: report.node,
                                    messageId: typeImportNames.length === 1
                                        ? 'aImportIsOnlyTypes'
                                        : 'someImportsAreOnlyTypes',
                                    data: {
                                        typeImports: typeImportNames.length === 1
                                            ? typeImportNames[0]
                                            : [
                                                typeImportNames.slice(0, -1).join(', '),
                                                typeImportNames.slice(-1)[0],
                                            ].join(' and '),
                                    },
                                    *fix(fixer) {
                                        yield* fixToTypeImport(fixer, report, sourceImports);
                                    },
                                });
                            }
                        }
                    }
                },
            }
            : {
                // prefer no type imports
                'ImportDeclaration[importKind = "type"]'(node) {
                    context.report({
                        node,
                        messageId: 'valueOverType',
                        fix(fixer) {
                            return fixToValueImport(fixer, node);
                        },
                    });
                },
            })), (disallowTypeAnnotations
            ? {
                // disallow `import()` type
                TSImportType(node) {
                    context.report({
                        node,
                        messageId: 'noImportTypeAnnotations',
                    });
                },
            }
            : {}));
        function* fixToTypeImport(fixer, report, sourceImports) {
            const { node } = report;
            const defaultSpecifier = node.specifiers[0].type === experimental_utils_1.AST_NODE_TYPES.ImportDefaultSpecifier
                ? node.specifiers[0]
                : null;
            const namespaceSpecifier = node.specifiers[0].type === experimental_utils_1.AST_NODE_TYPES.ImportNamespaceSpecifier
                ? node.specifiers[0]
                : null;
            const namedSpecifiers = node.specifiers.filter((specifier) => specifier.type === experimental_utils_1.AST_NODE_TYPES.ImportSpecifier);
            if (namespaceSpecifier) {
                // e.g.
                // import * as types from 'foo'
                yield* fixToTypeImportByInsertType(fixer, node, false);
                return;
            }
            else if (defaultSpecifier) {
                if (report.typeSpecifiers.includes(defaultSpecifier) &&
                    namedSpecifiers.length === 0) {
                    // e.g.
                    // import Type from 'foo'
                    yield* fixToTypeImportByInsertType(fixer, node, true);
                    return;
                }
            }
            else {
                if (namedSpecifiers.every(specifier => report.typeSpecifiers.includes(specifier))) {
                    // e.g.
                    // import {Type1, Type2} from 'foo'
                    yield* fixToTypeImportByInsertType(fixer, node, false);
                    return;
                }
            }
            const typeNamedSpecifiers = namedSpecifiers.filter(specifier => report.typeSpecifiers.includes(specifier));
            const fixesNamedSpecifiers = getFixesNamedSpecifiers(typeNamedSpecifiers, namedSpecifiers);
            const afterFixes = [];
            if (typeNamedSpecifiers.length) {
                if (sourceImports.typeOnlyNamedImport) {
                    const closingBraceToken = util.nullThrows(sourceCode.getFirstTokenBetween(sourceCode.getFirstToken(sourceImports.typeOnlyNamedImport), sourceImports.typeOnlyNamedImport.source, util.isClosingBraceToken), util.NullThrowsReasons.MissingToken('}', sourceImports.typeOnlyNamedImport.type));
                    let insertText = fixesNamedSpecifiers.typeNamedSpecifiersText;
                    const before = sourceCode.getTokenBefore(closingBraceToken);
                    if (!util.isCommaToken(before) && !util.isOpeningBraceToken(before)) {
                        insertText = ',' + insertText;
                    }
                    // import type { Already, Type1, Type2 } from 'foo'
                    //                       ^^^^^^^^^^^^^ insert
                    const insertTypeNamedSpecifiers = fixer.insertTextBefore(closingBraceToken, insertText);
                    if (sourceImports.typeOnlyNamedImport.range[1] <= node.range[0]) {
                        yield insertTypeNamedSpecifiers;
                    }
                    else {
                        afterFixes.push(insertTypeNamedSpecifiers);
                    }
                }
                else {
                    yield fixer.insertTextBefore(node, `import type {${fixesNamedSpecifiers.typeNamedSpecifiersText}} from ${sourceCode.getText(node.source)};\n`);
                }
            }
            if (defaultSpecifier &&
                report.typeSpecifiers.includes(defaultSpecifier)) {
                if (typeNamedSpecifiers.length === namedSpecifiers.length) {
                    const importToken = util.nullThrows(sourceCode.getFirstToken(node, isImportToken), util.NullThrowsReasons.MissingToken('import', node.type));
                    // import type Type from 'foo'
                    //        ^^^^ insert
                    yield fixer.insertTextAfter(importToken, ' type');
                }
                else {
                    yield fixer.insertTextBefore(node, `import type ${sourceCode.getText(defaultSpecifier)} from ${sourceCode.getText(node.source)};\n`);
                    // import Type , {...} from 'foo'
                    //        ^^^^^^ remove
                    yield fixer.remove(defaultSpecifier);
                    yield fixer.remove(sourceCode.getTokenAfter(defaultSpecifier));
                }
            }
            yield* fixesNamedSpecifiers.removeTypeNamedSpecifiers;
            yield* afterFixes;
            /**
             * Returns information for fixing named specifiers.
             */
            function getFixesNamedSpecifiers(typeNamedSpecifiers, allNamedSpecifiers) {
                const typeNamedSpecifiersTexts = [];
                const removeTypeNamedSpecifiers = [];
                if (typeNamedSpecifiers.length === allNamedSpecifiers.length) {
                    // e.g.
                    // import Foo, {Type1, Type2} from 'foo'
                    // import DefType, {Type1, Type2} from 'foo'
                    const openingBraceToken = util.nullThrows(sourceCode.getTokenBefore(typeNamedSpecifiers[0], util.isOpeningBraceToken), util.NullThrowsReasons.MissingToken('{', node.type));
                    const commaToken = util.nullThrows(sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken), util.NullThrowsReasons.MissingToken(',', node.type));
                    const closingBraceToken = util.nullThrows(sourceCode.getFirstTokenBetween(openingBraceToken, node.source, util.isClosingBraceToken), util.NullThrowsReasons.MissingToken('}', node.type));
                    // import DefType, {...} from 'foo'
                    //               ^^^^^^^ remove
                    removeTypeNamedSpecifiers.push(fixer.removeRange([
                        commaToken.range[0],
                        closingBraceToken.range[1],
                    ]));
                    typeNamedSpecifiersTexts.push(sourceCode.text.slice(openingBraceToken.range[1], closingBraceToken.range[0]));
                }
                else {
                    const typeNamedSpecifierGroups = [];
                    let group = [];
                    for (const namedSpecifier of allNamedSpecifiers) {
                        if (typeNamedSpecifiers.includes(namedSpecifier)) {
                            group.push(namedSpecifier);
                        }
                        else if (group.length) {
                            typeNamedSpecifierGroups.push(group);
                            group = [];
                        }
                    }
                    if (group.length) {
                        typeNamedSpecifierGroups.push(group);
                    }
                    for (const namedSpecifiers of typeNamedSpecifierGroups) {
                        const { removeRange, textRange } = getNamedSpecifierRanges(namedSpecifiers, allNamedSpecifiers);
                        removeTypeNamedSpecifiers.push(fixer.removeRange(removeRange));
                        typeNamedSpecifiersTexts.push(sourceCode.text.slice(...textRange));
                    }
                }
                return {
                    typeNamedSpecifiersText: typeNamedSpecifiersTexts.join(','),
                    removeTypeNamedSpecifiers,
                };
            }
            /**
             * Returns ranges for fixing named specifier.
             */
            function getNamedSpecifierRanges(namedSpecifierGroup, allNamedSpecifiers) {
                const first = namedSpecifierGroup[0];
                const last = namedSpecifierGroup[namedSpecifierGroup.length - 1];
                const removeRange = [first.range[0], last.range[1]];
                const textRange = [...removeRange];
                const before = sourceCode.getTokenBefore(first);
                textRange[0] = before.range[1];
                if (util.isCommaToken(before)) {
                    removeRange[0] = before.range[0];
                }
                else {
                    removeRange[0] = before.range[1];
                }
                const isFirst = allNamedSpecifiers[0] === first;
                const isLast = allNamedSpecifiers[allNamedSpecifiers.length - 1] === last;
                const after = sourceCode.getTokenAfter(last);
                textRange[1] = after.range[0];
                if (isFirst || isLast) {
                    if (util.isCommaToken(after)) {
                        removeRange[1] = after.range[1];
                    }
                }
                return {
                    textRange,
                    removeRange,
                };
            }
        }
        function* fixToTypeImportByInsertType(fixer, node, isDefaultImport) {
            // import type Foo from 'foo'
            //       ^^^^^ insert
            const importToken = util.nullThrows(sourceCode.getFirstToken(node, isImportToken), util.NullThrowsReasons.MissingToken('import', node.type));
            yield fixer.insertTextAfter(importToken, ' type');
            if (isDefaultImport) {
                // Has default import
                const openingBraceToken = sourceCode.getFirstTokenBetween(importToken, node.source, util.isOpeningBraceToken);
                if (openingBraceToken) {
                    // Only braces. e.g. import Foo, {} from 'foo'
                    const commaToken = util.nullThrows(sourceCode.getTokenBefore(openingBraceToken, util.isCommaToken), util.NullThrowsReasons.MissingToken(',', node.type));
                    const closingBraceToken = util.nullThrows(sourceCode.getFirstTokenBetween(openingBraceToken, node.source, util.isClosingBraceToken), util.NullThrowsReasons.MissingToken('}', node.type));
                    // import type Foo, {} from 'foo'
                    //                  ^^ remove
                    yield fixer.removeRange([
                        commaToken.range[0],
                        closingBraceToken.range[1],
                    ]);
                    const specifiersText = sourceCode.text.slice(commaToken.range[1], closingBraceToken.range[1]);
                    if (node.specifiers.length > 1) {
                        // import type Foo from 'foo'
                        // import type {...} from 'foo' // <- insert
                        yield fixer.insertTextAfter(node, `\nimport type${specifiersText} from ${sourceCode.getText(node.source)};`);
                    }
                }
            }
        }
        function fixToValueImport(fixer, node) {
            var _a, _b;
            // import type Foo from 'foo'
            //        ^^^^ remove
            const importToken = util.nullThrows(sourceCode.getFirstToken(node, isImportToken), util.NullThrowsReasons.MissingToken('import', node.type));
            const typeToken = util.nullThrows(sourceCode.getFirstTokenBetween(importToken, (_b = (_a = node.specifiers[0]) === null || _a === void 0 ? void 0 : _a.local) !== null && _b !== void 0 ? _b : node.source, isTypeToken), util.NullThrowsReasons.MissingToken('type', node.type));
            return fixer.remove(typeToken);
        }
    },
});
//# sourceMappingURL=consistent-type-imports.js.map