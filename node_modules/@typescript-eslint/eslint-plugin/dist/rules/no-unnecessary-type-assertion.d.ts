import type { TSESLint } from '@typescript-eslint/utils';
export type Options = [
    {
        checkLiteralConstAssertions?: boolean;
        typesToIgnore?: string[];
    }
];
export type MessageIds = 'contextuallyUnnecessary' | 'unnecessaryAssertion';
declare const _default: TSESLint.RuleModule<MessageIds, Options, import("../../rules").ESLintPluginDocs, TSESLint.RuleListener> & {
    name: string;
};
export default _default;
