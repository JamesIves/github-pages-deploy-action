"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _options;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorBase = exports.Visitor = void 0;
const VisitorBase_1 = require("./VisitorBase");
Object.defineProperty(exports, "VisitorBase", { enumerable: true, get: function () { return VisitorBase_1.VisitorBase; } });
const PatternVisitor_1 = require("./PatternVisitor");
class Visitor extends VisitorBase_1.VisitorBase {
    constructor(optionsOrVisitor) {
        super(optionsOrVisitor instanceof Visitor
            ? __classPrivateFieldGet(optionsOrVisitor, _options) : optionsOrVisitor);
        _options.set(this, void 0);
        __classPrivateFieldSet(this, _options, optionsOrVisitor instanceof Visitor
            ? __classPrivateFieldGet(optionsOrVisitor, _options) : optionsOrVisitor);
    }
    visitPattern(node, callback, options = { processRightHandNodes: false }) {
        // Call the callback at left hand identifier nodes, and Collect right hand nodes.
        const visitor = new PatternVisitor_1.PatternVisitor(__classPrivateFieldGet(this, _options), node, callback);
        visitor.visit(node);
        // Process the right hand nodes recursively.
        if (options.processRightHandNodes) {
            visitor.rightHandNodes.forEach(this.visit, this);
        }
    }
}
exports.Visitor = Visitor;
_options = new WeakMap();
//# sourceMappingURL=Visitor.js.map