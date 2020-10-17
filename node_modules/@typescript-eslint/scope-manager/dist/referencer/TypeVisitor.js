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
var _referencer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeVisitor = void 0;
const types_1 = require("@typescript-eslint/types");
const Visitor_1 = require("./Visitor");
const definition_1 = require("../definition");
const scope_1 = require("../scope");
class TypeVisitor extends Visitor_1.Visitor {
    constructor(referencer) {
        super(referencer);
        _referencer.set(this, void 0);
        __classPrivateFieldSet(this, _referencer, referencer);
    }
    static visit(referencer, node) {
        const typeReferencer = new TypeVisitor(referencer);
        typeReferencer.visit(node);
    }
    ///////////////////
    // Visit helpers //
    ///////////////////
    visitFunctionType(node) {
        // arguments and type parameters can only be referenced from within the function
        __classPrivateFieldGet(this, _referencer).scopeManager.nestFunctionTypeScope(node);
        this.visit(node.typeParameters);
        for (const param of node.params) {
            let didVisitAnnotation = false;
            this.visitPattern(param, (pattern, info) => {
                // a parameter name creates a value type variable which can be referenced later via typeof arg
                __classPrivateFieldGet(this, _referencer).currentScope()
                    .defineIdentifier(pattern, new definition_1.ParameterDefinition(pattern, node, info.rest));
                if (pattern.typeAnnotation) {
                    this.visit(pattern.typeAnnotation);
                    didVisitAnnotation = true;
                }
            });
            // there are a few special cases where the type annotation is owned by the parameter, not the pattern
            if (!didVisitAnnotation && 'typeAnnotation' in param) {
                this.visit(param.typeAnnotation);
            }
        }
        this.visit(node.returnType);
        __classPrivateFieldGet(this, _referencer).close(node);
    }
    visitPropertyKey(node) {
        if (!node.computed) {
            return;
        }
        // computed members are treated as value references, and TS expects they have a literal type
        __classPrivateFieldGet(this, _referencer).visit(node.key);
    }
    /////////////////////
    // Visit selectors //
    /////////////////////
    Identifier(node) {
        __classPrivateFieldGet(this, _referencer).currentScope().referenceType(node);
    }
    MemberExpression(node) {
        this.visit(node.object);
        // don't visit the property
    }
    TSCallSignatureDeclaration(node) {
        this.visitFunctionType(node);
    }
    TSConditionalType(node) {
        // conditional types can define inferred type parameters
        // which are only accessible from inside the conditional parameter
        __classPrivateFieldGet(this, _referencer).scopeManager.nestConditionalTypeScope(node);
        // type parameters inferred in the condition clause are not accessible within the false branch
        this.visitChildren(node, ['falseType']);
        __classPrivateFieldGet(this, _referencer).close(node);
        this.visit(node.falseType);
    }
    TSConstructorType(node) {
        this.visitFunctionType(node);
    }
    TSConstructSignatureDeclaration(node) {
        this.visitFunctionType(node);
    }
    TSFunctionType(node) {
        this.visitFunctionType(node);
    }
    TSIndexSignature(node) {
        for (const param of node.parameters) {
            if (param.type === types_1.AST_NODE_TYPES.Identifier) {
                this.visit(param.typeAnnotation);
            }
        }
        this.visit(node.typeAnnotation);
    }
    TSInferType(node) {
        const typeParameter = node.typeParameter;
        let scope = __classPrivateFieldGet(this, _referencer).currentScope();
        /*
        In cases where there is a sub-type scope created within a conditional type, then the generic should be defined in the
        conditional type's scope, not the child type scope.
        If we define it within the child type's scope then it won't be able to be referenced outside the child type
        */
        if (scope.type === scope_1.ScopeType.functionType ||
            scope.type === scope_1.ScopeType.mappedType) {
            // search up the scope tree to figure out if we're in a nested type scope
            let currentScope = scope.upper;
            while (currentScope) {
                if (currentScope.type === scope_1.ScopeType.functionType ||
                    currentScope.type === scope_1.ScopeType.mappedType) {
                    // ensure valid type parents only
                    currentScope = currentScope.upper;
                    continue;
                }
                if (currentScope.type === scope_1.ScopeType.conditionalType) {
                    scope = currentScope;
                    break;
                }
                break;
            }
        }
        scope.defineIdentifier(typeParameter.name, new definition_1.TypeDefinition(typeParameter.name, typeParameter));
    }
    TSInterfaceDeclaration(node) {
        var _a, _b;
        __classPrivateFieldGet(this, _referencer).currentScope()
            .defineIdentifier(node.id, new definition_1.TypeDefinition(node.id, node));
        if (node.typeParameters) {
            // type parameters cannot be referenced from outside their current scope
            __classPrivateFieldGet(this, _referencer).scopeManager.nestTypeScope(node);
            this.visit(node.typeParameters);
        }
        (_a = node.extends) === null || _a === void 0 ? void 0 : _a.forEach(this.visit, this);
        (_b = node.implements) === null || _b === void 0 ? void 0 : _b.forEach(this.visit, this);
        this.visit(node.body);
        if (node.typeParameters) {
            __classPrivateFieldGet(this, _referencer).close(node);
        }
    }
    TSMappedType(node) {
        // mapped types key can only be referenced within their return value
        __classPrivateFieldGet(this, _referencer).scopeManager.nestMappedTypeScope(node);
        this.visitChildren(node);
        __classPrivateFieldGet(this, _referencer).close(node);
    }
    TSMethodSignature(node) {
        this.visitPropertyKey(node);
        this.visitFunctionType(node);
    }
    TSNamedTupleMember(node) {
        this.visit(node.elementType);
        // we don't visit the label as the label only exists for the purposes of documentation
    }
    TSPropertySignature(node) {
        this.visitPropertyKey(node);
        this.visit(node.typeAnnotation);
    }
    TSQualifiedName(node) {
        this.visit(node.left);
        // we don't visit the right as it a name on the thing, not a name to reference
    }
    TSTypeAliasDeclaration(node) {
        __classPrivateFieldGet(this, _referencer).currentScope()
            .defineIdentifier(node.id, new definition_1.TypeDefinition(node.id, node));
        if (node.typeParameters) {
            // type parameters cannot be referenced from outside their current scope
            __classPrivateFieldGet(this, _referencer).scopeManager.nestTypeScope(node);
            this.visit(node.typeParameters);
        }
        this.visit(node.typeAnnotation);
        if (node.typeParameters) {
            __classPrivateFieldGet(this, _referencer).close(node);
        }
    }
    TSTypeParameter(node) {
        __classPrivateFieldGet(this, _referencer).currentScope()
            .defineIdentifier(node.name, new definition_1.TypeDefinition(node.name, node));
        this.visit(node.constraint);
        this.visit(node.default);
    }
    TSTypePredicate(node) {
        if (node.parameterName.type !== types_1.AST_NODE_TYPES.TSThisType) {
            __classPrivateFieldGet(this, _referencer).currentScope().referenceValue(node.parameterName);
        }
        this.visit(node.typeAnnotation);
    }
    // a type query `typeof foo` is a special case that references a _non-type_ variable,
    TSTypeQuery(node) {
        if (node.exprName.type === types_1.AST_NODE_TYPES.Identifier) {
            __classPrivateFieldGet(this, _referencer).currentScope().referenceValue(node.exprName);
        }
        else {
            let expr = node.exprName.left;
            while (expr.type !== types_1.AST_NODE_TYPES.Identifier) {
                expr = expr.left;
            }
            __classPrivateFieldGet(this, _referencer).currentScope().referenceValue(expr);
        }
    }
}
exports.TypeVisitor = TypeVisitor;
_referencer = new WeakMap();
//# sourceMappingURL=TypeVisitor.js.map