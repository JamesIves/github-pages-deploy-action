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
var _childVisitorKeys;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorBase = void 0;
const visitor_keys_1 = require("@typescript-eslint/visitor-keys");
function isObject(obj) {
    return typeof obj === 'object' && obj != null;
}
function isNode(node) {
    return isObject(node) && typeof node.type === 'string';
}
class VisitorBase {
    constructor(options) {
        var _a;
        _childVisitorKeys.set(this, void 0);
        __classPrivateFieldSet(this, _childVisitorKeys, (_a = options.childVisitorKeys) !== null && _a !== void 0 ? _a : visitor_keys_1.visitorKeys);
    }
    /**
     * Default method for visiting children.
     * @param node the node whose children should be visited
     * @param exclude a list of keys to not visit
     */
    visitChildren(node, excludeArr) {
        var _a;
        if (node == null || node.type == null) {
            return;
        }
        const exclude = new Set(excludeArr);
        const children = (_a = __classPrivateFieldGet(this, _childVisitorKeys)[node.type]) !== null && _a !== void 0 ? _a : Object.keys(node);
        for (const key of children) {
            if (exclude.has(key)) {
                continue;
            }
            const child = node[key];
            if (!child) {
                continue;
            }
            if (Array.isArray(child)) {
                for (const subChild of child) {
                    if (isNode(subChild)) {
                        this.visit(subChild);
                    }
                }
            }
            else if (isNode(child)) {
                this.visit(child);
            }
        }
    }
    /**
     * Dispatching node.
     */
    visit(node) {
        if (node == null || node.type == null) {
            return;
        }
        const visitor = this[node.type];
        if (visitor) {
            return visitor.call(this, node);
        }
        this.visitChildren(node);
    }
}
exports.VisitorBase = VisitorBase;
_childVisitorKeys = new WeakMap();
//# sourceMappingURL=VisitorBase.js.map