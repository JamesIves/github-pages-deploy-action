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
var _flag, _referenceType;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceTypeFlag = exports.ReferenceFlag = exports.Reference = void 0;
const ID_1 = require("../ID");
var ReferenceFlag;
(function (ReferenceFlag) {
    ReferenceFlag[ReferenceFlag["Read"] = 1] = "Read";
    ReferenceFlag[ReferenceFlag["Write"] = 2] = "Write";
    ReferenceFlag[ReferenceFlag["ReadWrite"] = 3] = "ReadWrite";
})(ReferenceFlag || (ReferenceFlag = {}));
exports.ReferenceFlag = ReferenceFlag;
const generator = ID_1.createIdGenerator();
var ReferenceTypeFlag;
(function (ReferenceTypeFlag) {
    ReferenceTypeFlag[ReferenceTypeFlag["Value"] = 1] = "Value";
    ReferenceTypeFlag[ReferenceTypeFlag["Type"] = 2] = "Type";
})(ReferenceTypeFlag || (ReferenceTypeFlag = {}));
exports.ReferenceTypeFlag = ReferenceTypeFlag;
/**
 * A Reference represents a single occurrence of an identifier in code.
 */
class Reference {
    constructor(identifier, scope, flag, writeExpr, maybeImplicitGlobal, init, referenceType = ReferenceTypeFlag.Value) {
        /**
         * A unique ID for this instance - primarily used to help debugging and testing
         */
        this.$id = generator();
        /**
         * The read-write mode of the reference.
         */
        _flag.set(this, void 0);
        /**
         * In some cases, a reference may be a type, value or both a type and value reference.
         */
        _referenceType.set(this, void 0);
        this.identifier = identifier;
        this.from = scope;
        this.resolved = null;
        __classPrivateFieldSet(this, _flag, flag);
        if (this.isWrite()) {
            this.writeExpr = writeExpr;
            this.init = init;
        }
        this.maybeImplicitGlobal = maybeImplicitGlobal;
        __classPrivateFieldSet(this, _referenceType, referenceType);
    }
    /**
     * True if this reference can reference types
     */
    get isTypeReference() {
        return (__classPrivateFieldGet(this, _referenceType) & ReferenceTypeFlag.Type) !== 0;
    }
    /**
     * True if this reference can reference values
     */
    get isValueReference() {
        return (__classPrivateFieldGet(this, _referenceType) & ReferenceTypeFlag.Value) !== 0;
    }
    /**
     * Whether the reference is writeable.
     * @public
     */
    isWrite() {
        return !!(__classPrivateFieldGet(this, _flag) & ReferenceFlag.Write);
    }
    /**
     * Whether the reference is readable.
     * @public
     */
    isRead() {
        return !!(__classPrivateFieldGet(this, _flag) & ReferenceFlag.Read);
    }
    /**
     * Whether the reference is read-only.
     * @public
     */
    isReadOnly() {
        return __classPrivateFieldGet(this, _flag) === ReferenceFlag.Read;
    }
    /**
     * Whether the reference is write-only.
     * @public
     */
    isWriteOnly() {
        return __classPrivateFieldGet(this, _flag) === ReferenceFlag.Write;
    }
    /**
     * Whether the reference is read-write.
     * @public
     */
    isReadWrite() {
        return __classPrivateFieldGet(this, _flag) === ReferenceFlag.ReadWrite;
    }
}
exports.Reference = Reference;
_flag = new WeakMap(), _referenceType = new WeakMap();
//# sourceMappingURL=Reference.js.map