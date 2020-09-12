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
var _options;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeManager = void 0;
const assert_1 = require("./assert");
const scope_1 = require("./scope");
class ScopeManager {
    constructor(options) {
        _options.set(this, void 0);
        this.scopes = [];
        this.globalScope = null;
        this.nodeToScope = new WeakMap();
        this.currentScope = null;
        __classPrivateFieldSet(this, _options, options);
        this.declaredVariables = new WeakMap();
    }
    get variables() {
        const variables = new Set();
        function recurse(scope) {
            scope.variables.forEach(v => variables.add(v));
            scope.childScopes.forEach(recurse);
        }
        this.scopes.forEach(recurse);
        return Array.from(variables).sort((a, b) => a.$id - b.$id);
    }
    isGlobalReturn() {
        return __classPrivateFieldGet(this, _options).globalReturn === true;
    }
    isModule() {
        return __classPrivateFieldGet(this, _options).sourceType === 'module';
    }
    isImpliedStrict() {
        return __classPrivateFieldGet(this, _options).impliedStrict === true;
    }
    isStrictModeSupported() {
        return __classPrivateFieldGet(this, _options).ecmaVersion != null && __classPrivateFieldGet(this, _options).ecmaVersion >= 5;
    }
    isES6() {
        return __classPrivateFieldGet(this, _options).ecmaVersion != null && __classPrivateFieldGet(this, _options).ecmaVersion >= 6;
    }
    /**
     * Get the variables that a given AST node defines. The gotten variables' `def[].node`/`def[].parent` property is the node.
     * If the node does not define any variable, this returns an empty array.
     * @param node An AST node to get their variables.
     * @public
     */
    getDeclaredVariables(node) {
        var _a;
        return (_a = this.declaredVariables.get(node)) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Get the scope of a given AST node. The gotten scope's `block` property is the node.
     * This method never returns `function-expression-name` scope. If the node does not have their scope, this returns `null`.
     *
     * @param node An AST node to get their scope.
     * @param inner If the node has multiple scopes, this returns the outermost scope normally.
     *                If `inner` is `true` then this returns the innermost scope.
     * @public
     */
    acquire(node, inner = false) {
        function predicate(testScope) {
            if (testScope.type === 'function' && testScope.functionExpressionScope) {
                return false;
            }
            return true;
        }
        const scopes = this.nodeToScope.get(node);
        if (!scopes || scopes.length === 0) {
            return null;
        }
        // Heuristic selection from all scopes.
        // If you would like to get all scopes, please use ScopeManager#acquireAll.
        if (scopes.length === 1) {
            return scopes[0];
        }
        if (inner) {
            for (let i = scopes.length - 1; i >= 0; --i) {
                const scope = scopes[i];
                if (predicate(scope)) {
                    return scope;
                }
            }
        }
        else {
            for (let i = 0; i < scopes.length; ++i) {
                const scope = scopes[i];
                if (predicate(scope)) {
                    return scope;
                }
            }
        }
        return null;
    }
    nestScope(scope) {
        if (scope instanceof scope_1.GlobalScope) {
            assert_1.assert(this.currentScope === null);
            this.globalScope = scope;
        }
        this.currentScope = scope;
        return scope;
    }
    nestBlockScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.BlockScope(this, this.currentScope, node));
    }
    nestCatchScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.CatchScope(this, this.currentScope, node));
    }
    nestClassScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.ClassScope(this, this.currentScope, node));
    }
    nestConditionalTypeScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.ConditionalTypeScope(this, this.currentScope, node));
    }
    nestForScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.ForScope(this, this.currentScope, node));
    }
    nestFunctionExpressionNameScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.FunctionExpressionNameScope(this, this.currentScope, node));
    }
    nestFunctionScope(node, isMethodDefinition) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.FunctionScope(this, this.currentScope, node, isMethodDefinition));
    }
    nestFunctionTypeScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.FunctionTypeScope(this, this.currentScope, node));
    }
    nestGlobalScope(node) {
        return this.nestScope(new scope_1.GlobalScope(this, node));
    }
    nestMappedTypeScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.MappedTypeScope(this, this.currentScope, node));
    }
    nestModuleScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.ModuleScope(this, this.currentScope, node));
    }
    nestSwitchScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.SwitchScope(this, this.currentScope, node));
    }
    nestTSEnumScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.TSEnumScope(this, this.currentScope, node));
    }
    nestTSModuleScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.TSModuleScope(this, this.currentScope, node));
    }
    nestTypeScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.TypeScope(this, this.currentScope, node));
    }
    nestWithScope(node) {
        assert_1.assert(this.currentScope);
        return this.nestScope(new scope_1.WithScope(this, this.currentScope, node));
    }
}
exports.ScopeManager = ScopeManager;
_options = new WeakMap();
//# sourceMappingURL=ScopeManager.js.map