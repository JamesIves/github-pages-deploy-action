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
var _declaration, _referencer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportVisitor = void 0;
const definition_1 = require("../definition");
const Visitor_1 = require("./Visitor");
class ImportVisitor extends Visitor_1.Visitor {
    constructor(declaration, referencer) {
        super(referencer);
        _declaration.set(this, void 0);
        _referencer.set(this, void 0);
        __classPrivateFieldSet(this, _declaration, declaration);
        __classPrivateFieldSet(this, _referencer, referencer);
    }
    static visit(referencer, declaration) {
        const importReferencer = new ImportVisitor(declaration, referencer);
        importReferencer.visit(declaration);
    }
    visitImport(id, specifier) {
        __classPrivateFieldGet(this, _referencer).currentScope()
            .defineIdentifier(id, new definition_1.ImportBindingDefinition(id, specifier, __classPrivateFieldGet(this, _declaration)));
    }
    ImportNamespaceSpecifier(node) {
        const local = node.local;
        this.visitImport(local, node);
    }
    ImportDefaultSpecifier(node) {
        const local = node.local;
        this.visitImport(local, node);
    }
    ImportSpecifier(node) {
        const local = node.local;
        this.visitImport(local, node);
    }
}
exports.ImportVisitor = ImportVisitor;
_declaration = new WeakMap(), _referencer = new WeakMap();
//# sourceMappingURL=ImportVisitor.js.map