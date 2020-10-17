import * as scopeManager from '@typescript-eslint/scope-manager';
import { TSESTree } from '@typescript-eslint/types';
declare namespace Scope {
    class ESLintScopeVariable {
        readonly defs: Definition[];
        readonly identifiers: TSESTree.Identifier[];
        readonly name: string;
        readonly references: Reference[];
        readonly scope: Scope;
        /**
         * Written to by ESLint.
         * If this key exists, this variable is a global variable added by ESLint.
         * If this is `true`, this variable can be assigned arbitrary values.
         * If this is `false`, this variable is readonly.
         */
        writeable?: boolean;
        /**
         * Written to by ESLint.
         * This property is undefined if there are no globals directive comments.
         * The array of globals directive comments which defined this global variable in the source code file.
         */
        eslintExplicitGlobal?: boolean;
        /**
         * Written to by ESLint.
         * The configured value in config files. This can be different from `variable.writeable` if there are globals directive comments.
         */
        eslintImplicitGlobalSetting?: 'readonly' | 'writable';
        /**
         * Written to by ESLint.
         * If this key exists, it is a global variable added by ESLint.
         * If `true`, this global variable was defined by a globals directive comment in the source code file.
         */
        eslintExplicitGlobalComments?: TSESTree.Comment[];
    }
    export type ScopeManager = scopeManager.ScopeManager;
    export type Reference = scopeManager.Reference;
    export type Variable = scopeManager.Variable | ESLintScopeVariable;
    export type Scope = scopeManager.Scope;
    export const ScopeType: typeof scopeManager.ScopeType;
    export type DefinitionType = scopeManager.Definition;
    export type Definition = scopeManager.Definition;
    export const DefinitionType: typeof scopeManager.DefinitionType;
    export {};
}
export { Scope };
//# sourceMappingURL=Scope.d.ts.map
