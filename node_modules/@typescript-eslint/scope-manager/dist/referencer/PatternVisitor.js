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
var _rootPattern, _callback, _assignments, _restElements;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternVisitor = void 0;
const types_1 = require("@typescript-eslint/types");
const Visitor_1 = require("./Visitor");
class PatternVisitor extends Visitor_1.VisitorBase {
    constructor(options, rootPattern, callback) {
        super(options);
        _rootPattern.set(this, void 0);
        _callback.set(this, void 0);
        _assignments.set(this, []);
        this.rightHandNodes = [];
        _restElements.set(this, []);
        __classPrivateFieldSet(this, _rootPattern, rootPattern);
        __classPrivateFieldSet(this, _callback, callback);
    }
    static isPattern(node) {
        const nodeType = node.type;
        return (nodeType === types_1.AST_NODE_TYPES.Identifier ||
            nodeType === types_1.AST_NODE_TYPES.ObjectPattern ||
            nodeType === types_1.AST_NODE_TYPES.ArrayPattern ||
            nodeType === types_1.AST_NODE_TYPES.SpreadElement ||
            nodeType === types_1.AST_NODE_TYPES.RestElement ||
            nodeType === types_1.AST_NODE_TYPES.AssignmentPattern);
    }
    ArrayExpression(node) {
        node.elements.forEach(this.visit, this);
    }
    ArrayPattern(pattern) {
        for (const element of pattern.elements) {
            this.visit(element);
        }
    }
    AssignmentExpression(node) {
        __classPrivateFieldGet(this, _assignments).push(node);
        this.visit(node.left);
        this.rightHandNodes.push(node.right);
        __classPrivateFieldGet(this, _assignments).pop();
    }
    AssignmentPattern(pattern) {
        __classPrivateFieldGet(this, _assignments).push(pattern);
        this.visit(pattern.left);
        this.rightHandNodes.push(pattern.right);
        __classPrivateFieldGet(this, _assignments).pop();
    }
    CallExpression(node) {
        // arguments are right hand nodes.
        node.arguments.forEach(a => {
            this.rightHandNodes.push(a);
        });
        this.visit(node.callee);
    }
    Decorator() {
        // don't visit any decorators when exploring a pattern
    }
    Identifier(pattern) {
        var _a;
        const lastRestElement = (_a = __classPrivateFieldGet(this, _restElements)[__classPrivateFieldGet(this, _restElements).length - 1]) !== null && _a !== void 0 ? _a : null;
        __classPrivateFieldGet(this, _callback).call(this, pattern, {
            topLevel: pattern === __classPrivateFieldGet(this, _rootPattern),
            rest: lastRestElement !== null &&
                lastRestElement !== undefined &&
                lastRestElement.argument === pattern,
            assignments: __classPrivateFieldGet(this, _assignments),
        });
    }
    MemberExpression(node) {
        // Computed property's key is a right hand node.
        if (node.computed) {
            this.rightHandNodes.push(node.property);
        }
        // the object is only read, write to its property.
        this.rightHandNodes.push(node.object);
    }
    Property(property) {
        // Computed property's key is a right hand node.
        if (property.computed) {
            this.rightHandNodes.push(property.key);
        }
        // If it's shorthand, its key is same as its value.
        // If it's shorthand and has its default value, its key is same as its value.left (the value is AssignmentPattern).
        // If it's not shorthand, the name of new variable is its value's.
        this.visit(property.value);
    }
    RestElement(pattern) {
        __classPrivateFieldGet(this, _restElements).push(pattern);
        this.visit(pattern.argument);
        __classPrivateFieldGet(this, _restElements).pop();
    }
    SpreadElement(node) {
        this.visit(node.argument);
    }
    TSTypeAnnotation() {
        // we don't want to visit types
    }
}
exports.PatternVisitor = PatternVisitor;
_rootPattern = new WeakMap(), _callback = new WeakMap(), _assignments = new WeakMap(), _restElements = new WeakMap();
//# sourceMappingURL=PatternVisitor.js.map