import { ParserServices, TSESLint } from '../';
declare type RequiredParserServices = {
    [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>;
};
/**
 * Try to retrieve typescript parser service from context
 */
export declare function getParserServices<TMessageIds extends string, TOptions extends unknown[]>(context: TSESLint.RuleContext<TMessageIds, TOptions>): RequiredParserServices;
export {};
//# sourceMappingURL=getParserServices.d.ts.map