"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'require-array-sort-compare',
    defaultOptions: [],
    meta: {
        type: 'problem',
        docs: {
            description: 'Requires `Array#sort` calls to always provide a `compareFunction`',
            category: 'Best Practices',
            recommended: false,
            requiresTypeChecking: true,
        },
        messages: {
            requireCompare: "Require 'compare' argument.",
        },
        schema: [],
    },
    create(context) {
        const service = util.getParserServices(context);
        const checker = service.program.getTypeChecker();
        return {
            ":matches(CallExpression, OptionalCallExpression)[arguments.length=0] > :matches(MemberExpression, OptionalMemberExpression)[property.name='sort'][computed=false]"(node) {
                // Get the symbol of the `sort` method.
                const tsNode = service.esTreeNodeToTSNodeMap.get(node);
                const sortSymbol = checker.getSymbolAtLocation(tsNode);
                if (sortSymbol == null) {
                    return;
                }
                // Check the owner type of the `sort` method.
                for (const methodDecl of sortSymbol.declarations) {
                    const typeDecl = methodDecl.parent;
                    if (ts.isInterfaceDeclaration(typeDecl) &&
                        ts.isSourceFile(typeDecl.parent) &&
                        typeDecl.name.escapedText === 'Array') {
                        context.report({ node: node.parent, messageId: 'requireCompare' });
                        return;
                    }
                }
            },
        };
    },
});
//# sourceMappingURL=require-array-sort-compare.js.map