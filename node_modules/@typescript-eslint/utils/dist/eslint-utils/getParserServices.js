"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParserServices = void 0;
const parserPathSeemsToBeTSESLint_1 = require("./parserPathSeemsToBeTSESLint");
const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES = 'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';
const ERROR_MESSAGE_UNKNOWN_PARSER = 'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.';
function getParserServices(context, allowWithoutFullTypeInformation = false) {
    // This check is unnecessary if the user is using the latest version of our parser.
    //
    // However the world isn't perfect:
    // - Users often use old parser versions.
    //   Old versions of the parser would not return any parserServices unless parserOptions.project was set.
    // - Users sometimes use parsers that aren't @typescript-eslint/parser
    //   Other parsers won't return the parser services we expect (if they return any at all).
    //
    // This check allows us to handle bad user setups whilst providing a nice user-facing
    // error message explaining the problem.
    if (context.sourceCode.parserServices?.esTreeNodeToTSNodeMap == null ||
        context.sourceCode.parserServices.tsNodeToESTreeNodeMap == null) {
        throwError(context.parserPath);
    }
    // if a rule requires full type information, then hard fail if it doesn't exist
    // this forces the user to supply parserOptions.project
    if (context.sourceCode.parserServices.program == null &&
        !allowWithoutFullTypeInformation) {
        throwError(context.parserPath);
    }
    return context.sourceCode.parserServices;
}
exports.getParserServices = getParserServices;
/* eslint-enable @typescript-eslint/unified-signatures */
function throwError(parserPath) {
    const messages = [
        ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
        `Parser: ${parserPath}`,
    ];
    if (!(0, parserPathSeemsToBeTSESLint_1.parserPathSeemsToBeTSESLint)(parserPath)) {
        messages.push(ERROR_MESSAGE_UNKNOWN_PARSER);
    }
    throw new Error(messages.join('\n'));
}
//# sourceMappingURL=getParserServices.js.map