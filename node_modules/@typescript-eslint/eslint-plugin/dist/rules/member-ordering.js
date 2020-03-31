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
const allMemberTypes = ['field', 'method', 'constructor'].reduce((all, type) => {
    all.push(type);
    ['public', 'protected', 'private'].forEach(accessibility => {
        all.push(`${accessibility}-${type}`); // e.g. `public-field`
        if (type !== 'constructor') {
            // There is no `static-constructor` or `instance-constructor or `abstract-constructor`
            ['static', 'instance', 'abstract'].forEach(scope => {
                if (!all.includes(`${scope}-${type}`)) {
                    all.push(`${scope}-${type}`);
                }
                all.push(`${accessibility}-${scope}-${type}`);
            });
        }
    });
    return all;
}, []);
allMemberTypes.unshift('signature');
exports.default = util.createRule({
    name: 'member-ordering',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require a consistent member declaration order',
            category: 'Stylistic Issues',
            recommended: false,
        },
        messages: {
            incorrectOrder: 'Member {{name}} should be declared before all {{rank}} definitions.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    default: {
                        oneOf: [
                            {
                                enum: ['never'],
                            },
                            {
                                type: 'array',
                                items: {
                                    enum: allMemberTypes,
                                },
                            },
                        ],
                    },
                    classes: {
                        oneOf: [
                            {
                                enum: ['never'],
                            },
                            {
                                type: 'array',
                                items: {
                                    enum: allMemberTypes,
                                },
                            },
                        ],
                    },
                    classExpressions: {
                        oneOf: [
                            {
                                enum: ['never'],
                            },
                            {
                                type: 'array',
                                items: {
                                    enum: allMemberTypes,
                                },
                            },
                        ],
                    },
                    interfaces: {
                        oneOf: [
                            {
                                enum: ['never'],
                            },
                            {
                                type: 'array',
                                items: {
                                    enum: ['signature', 'field', 'method', 'constructor'],
                                },
                            },
                        ],
                    },
                    typeLiterals: {
                        oneOf: [
                            {
                                enum: ['never'],
                            },
                            {
                                type: 'array',
                                items: {
                                    enum: ['signature', 'field', 'method', 'constructor'],
                                },
                            },
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            default: [
                'signature',
                'public-static-field',
                'protected-static-field',
                'private-static-field',
                'public-instance-field',
                'protected-instance-field',
                'private-instance-field',
                'public-abstract-field',
                'protected-abstract-field',
                'private-abstract-field',
                'public-field',
                'protected-field',
                'private-field',
                'static-field',
                'instance-field',
                'abstract-field',
                'field',
                'constructor',
                'public-static-method',
                'protected-static-method',
                'private-static-method',
                'public-instance-method',
                'protected-instance-method',
                'private-instance-method',
                'public-abstract-method',
                'protected-abstract-method',
                'private-abstract-method',
                'public-method',
                'protected-method',
                'private-method',
                'static-method',
                'instance-method',
                'abstract-method',
                'method',
            ],
        },
    ],
    create(context, [options]) {
        const sourceCode = context.getSourceCode();
        const functionExpressions = [
            experimental_utils_1.AST_NODE_TYPES.FunctionExpression,
            experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
        ];
        /**
         * Gets the node type.
         * @param node the node to be evaluated.
         */
        function getNodeType(node) {
            // TODO: add missing TSCallSignatureDeclaration
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition:
                case experimental_utils_1.AST_NODE_TYPES.MethodDefinition:
                    return node.kind;
                case experimental_utils_1.AST_NODE_TYPES.TSMethodSignature:
                    return 'method';
                case experimental_utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration:
                    return 'constructor';
                case experimental_utils_1.AST_NODE_TYPES.TSAbstractClassProperty:
                case experimental_utils_1.AST_NODE_TYPES.ClassProperty:
                    return node.value && functionExpressions.includes(node.value.type)
                        ? 'method'
                        : 'field';
                case experimental_utils_1.AST_NODE_TYPES.TSPropertySignature:
                    return 'field';
                case experimental_utils_1.AST_NODE_TYPES.TSIndexSignature:
                    return 'signature';
                default:
                    return null;
            }
        }
        /**
         * Gets the member name based on the member type.
         * @param node the node to be evaluated.
         */
        function getMemberName(node) {
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.TSPropertySignature:
                case experimental_utils_1.AST_NODE_TYPES.TSMethodSignature:
                case experimental_utils_1.AST_NODE_TYPES.TSAbstractClassProperty:
                case experimental_utils_1.AST_NODE_TYPES.ClassProperty:
                    return util.getNameFromMember(node, sourceCode);
                case experimental_utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition:
                case experimental_utils_1.AST_NODE_TYPES.MethodDefinition:
                    return node.kind === 'constructor'
                        ? 'constructor'
                        : util.getNameFromMember(node, sourceCode);
                case experimental_utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration:
                    return 'new';
                case experimental_utils_1.AST_NODE_TYPES.TSIndexSignature:
                    return util.getNameFromIndexSignature(node);
                default:
                    return null;
            }
        }
        /**
         * Gets the calculated rank using the provided method definition.
         * The algorithm is as follows:
         * - Get the rank based on the accessibility-scope-type name, e.g. public-instance-field
         * - If there is no order for accessibility-scope-type, then strip out the accessibility.
         * - If there is no order for scope-type, then strip out the scope.
         * - If there is no order for type, then return -1
         * @param memberTypes the valid names to be validated.
         * @param order the current order to be validated.
         *
         * @return Index of the matching member type in the order configuration.
         */
        function getRankOrder(memberTypes, order) {
            let rank = -1;
            const stack = memberTypes.slice(); // Get a copy of the member types
            while (stack.length > 0 && rank === -1) {
                rank = order.indexOf(stack.shift());
            }
            return rank;
        }
        /**
         * Gets the rank of the node given the order.
         * @param node the node to be evaluated.
         * @param order the current order to be validated.
         * @param supportsModifiers a flag indicating whether the type supports modifiers (scope or accessibility) or not.
         */
        function getRank(node, order, supportsModifiers) {
            const type = getNodeType(node);
            if (type === null) {
                // shouldn't happen but just in case, put it on the end
                return order.length - 1;
            }
            const abstract = node.type === experimental_utils_1.AST_NODE_TYPES.TSAbstractClassProperty ||
                node.type === experimental_utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition;
            const scope = 'static' in node && node.static
                ? 'static'
                : abstract
                    ? 'abstract'
                    : 'instance';
            const accessibility = 'accessibility' in node && node.accessibility
                ? node.accessibility
                : 'public';
            const memberTypes = [];
            if (supportsModifiers) {
                if (type !== 'constructor') {
                    // Constructors have no scope
                    memberTypes.push(`${accessibility}-${scope}-${type}`);
                    memberTypes.push(`${scope}-${type}`);
                }
                memberTypes.push(`${accessibility}-${type}`);
            }
            memberTypes.push(type);
            return getRankOrder(memberTypes, order);
        }
        /**
         * Gets the lowest possible rank higher than target.
         * e.g. given the following order:
         *   ...
         *   public-static-method
         *   protected-static-method
         *   private-static-method
         *   public-instance-method
         *   protected-instance-method
         *   private-instance-method
         *   ...
         * and considering that a public-instance-method has already been declared, so ranks contains
         * public-instance-method, then the lowest possible rank for public-static-method is
         * public-instance-method.
         * @param ranks the existing ranks in the object.
         * @param target the target rank.
         * @param order the current order to be validated.
         * @returns the name of the lowest possible rank without dashes (-).
         */
        function getLowestRank(ranks, target, order) {
            let lowest = ranks[ranks.length - 1];
            ranks.forEach(rank => {
                if (rank > target) {
                    lowest = Math.min(lowest, rank);
                }
            });
            return order[lowest].replace(/-/g, ' ');
        }
        /**
         * Validates if all members are correctly sorted.
         *
         * @param members Members to be validated.
         * @param order Current order to be validated.
         * @param supportsModifiers A flag indicating whether the type supports modifiers (scope or accessibility) or not.
         */
        function validateMembersOrder(members, order, supportsModifiers) {
            if (members && order !== 'never') {
                const previousRanks = [];
                // Find first member which isn't correctly sorted
                members.forEach(member => {
                    const rank = getRank(member, order, supportsModifiers);
                    if (rank !== -1) {
                        if (rank < previousRanks[previousRanks.length - 1]) {
                            context.report({
                                node: member,
                                messageId: 'incorrectOrder',
                                data: {
                                    name: getMemberName(member),
                                    rank: getLowestRank(previousRanks, rank, order),
                                },
                            });
                        }
                        else {
                            previousRanks.push(rank);
                        }
                    }
                });
            }
        }
        return {
            ClassDeclaration(node) {
                var _a;
                validateMembersOrder(node.body.body, (_a = options.classes) !== null && _a !== void 0 ? _a : options.default, true);
            },
            ClassExpression(node) {
                var _a;
                validateMembersOrder(node.body.body, (_a = options.classExpressions) !== null && _a !== void 0 ? _a : options.default, true);
            },
            TSInterfaceDeclaration(node) {
                var _a;
                validateMembersOrder(node.body.body, (_a = options.interfaces) !== null && _a !== void 0 ? _a : options.default, false);
            },
            TSTypeLiteral(node) {
                var _a;
                validateMembersOrder(node.members, (_a = options.typeLiterals) !== null && _a !== void 0 ? _a : options.default, false);
            },
        };
    },
});
//# sourceMappingURL=member-ordering.js.map