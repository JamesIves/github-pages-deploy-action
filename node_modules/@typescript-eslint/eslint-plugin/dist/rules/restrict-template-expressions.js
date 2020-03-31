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
const ts = __importStar(require("typescript"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'restrict-template-expressions',
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce template literal expressions to be of string type',
            category: 'Best Practices',
            recommended: false,
            requiresTypeChecking: true,
        },
        messages: {
            invalidType: 'Invalid type of template literal expression.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowBoolean: { type: 'boolean' },
                    allowNullable: { type: 'boolean' },
                    allowNumber: { type: 'boolean' },
                },
            },
        ],
    },
    defaultOptions: [{}],
    create(context, [options]) {
        const service = util.getParserServices(context);
        const typeChecker = service.program.getTypeChecker();
        const allowedTypes = [
            'string',
            ...(options.allowNumber ? ['number', 'bigint'] : []),
            ...(options.allowBoolean ? ['boolean'] : []),
            ...(options.allowNullable ? ['null', 'undefined'] : []),
        ];
        function isAllowedType(types) {
            for (const type of types) {
                if (!allowedTypes.includes(type)) {
                    return false;
                }
            }
            return true;
        }
        return {
            TemplateLiteral(node) {
                // don't check tagged template literals
                if (node.parent.type === experimental_utils_1.AST_NODE_TYPES.TaggedTemplateExpression) {
                    return;
                }
                for (const expr of node.expressions) {
                    const type = getNodeType(expr);
                    if (!isAllowedType(type)) {
                        context.report({
                            node: expr,
                            messageId: 'invalidType',
                        });
                    }
                }
            },
        };
        /**
         * Helper function to get base type of node
         * @param node the node to be evaluated.
         */
        function getNodeType(node) {
            const tsNode = service.esTreeNodeToTSNodeMap.get(node);
            const type = typeChecker.getTypeAtLocation(tsNode);
            return getBaseType(type);
        }
        function getBaseType(type) {
            const constraint = type.getConstraint();
            if (constraint &&
                // for generic types with union constraints, it will return itself
                constraint !== type) {
                return getBaseType(constraint);
            }
            if (type.isStringLiteral()) {
                return ['string'];
            }
            if (type.isNumberLiteral()) {
                return ['number'];
            }
            if (type.flags & ts.TypeFlags.BigIntLiteral) {
                return ['bigint'];
            }
            if (type.flags & ts.TypeFlags.BooleanLiteral) {
                return ['boolean'];
            }
            if (type.flags & ts.TypeFlags.Null) {
                return ['null'];
            }
            if (type.flags & ts.TypeFlags.Undefined) {
                return ['undefined'];
            }
            if (type.isUnion()) {
                return type.types
                    .map(getBaseType)
                    .reduce((all, array) => [...all, ...array], []);
            }
            const stringType = typeChecker.typeToString(type);
            if (stringType === 'string' ||
                stringType === 'number' ||
                stringType === 'bigint' ||
                stringType === 'boolean') {
                return [stringType];
            }
            return ['other'];
        }
    },
});
//# sourceMappingURL=restrict-template-expressions.js.map