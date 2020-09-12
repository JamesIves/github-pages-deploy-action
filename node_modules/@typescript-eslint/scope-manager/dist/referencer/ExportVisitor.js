"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _referencer, _exportNode;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportVisitor = void 0;
const types_1 = require("@typescript-eslint/types");
const Visitor_1 = require("./Visitor");
class ExportVisitor extends Visitor_1.Visitor {
    constructor(node, referencer) {
        super(referencer);
        _referencer.set(this, void 0);
        _exportNode.set(this, void 0);
        __classPrivateFieldSet(this, _exportNode, node);
        __classPrivateFieldSet(this, _referencer, referencer);
    }
    static visit(referencer, node) {
        const exportReferencer = new ExportVisitor(node, referencer);
        exportReferencer.visit(node);
    }
    Identifier(node) {
        if (__classPrivateFieldGet(this, _exportNode).exportKind === 'type') {
            // type exports can only reference types
            __classPrivateFieldGet(this, _referencer).currentScope().referenceType(node);
        }
        else {
            __classPrivateFieldGet(this, _referencer).currentScope().referenceDualValueType(node);
        }
    }
    ExportDefaultDeclaration(node) {
        if (node.declaration.type === types_1.AST_NODE_TYPES.Identifier) {
            // export default A;
            // this could be a type or a variable
            this.visit(node.declaration);
        }
        else {
            // export const a = 1;
            // export something();
            // etc
            // these not included in the scope of this visitor as they are all guaranteed to be values or declare variables
        }
    }
    ExportNamedDeclaration(node) {
        if (node.source) {
            // export ... from 'foo';
            // these are external identifiers so there shouldn't be references or defs
            return;
        }
        if (!node.declaration) {
            // export { x };
            this.visitChildren(node);
        }
        else {
            // export const x = 1;
            // this is not included in the scope of this visitor as it creates a variable
        }
    }
    ExportSpecifier(node) {
        this.visit(node.local);
    }
}
exports.ExportVisitor = ExportVisitor;
_referencer = new WeakMap(), _exportNode = new WeakMap();
//# sourceMappingURL=ExportVisitor.js.map