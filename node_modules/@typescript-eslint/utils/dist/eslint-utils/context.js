"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceCode = exports.getScope = exports.getFilename = exports.getDeclaredVariables = exports.getCwd = exports.getAncestors = void 0;
/** @deprecated use `context.sourceCode.getAncestors(node)` */
function getAncestors(context) {
    return context.getAncestors();
}
exports.getAncestors = getAncestors;
/** @deprecated use `context.sourceCode.getCwd()` */
function getCwd(context) {
    return context.getCwd();
}
exports.getCwd = getCwd;
/** @deprecated use `context.sourceCode.getDeclaredVariables(node)` */
function getDeclaredVariables(context, node) {
    return context.sourceCode.getDeclaredVariables(node);
}
exports.getDeclaredVariables = getDeclaredVariables;
/** @deprecated use `context.filename` */
function getFilename(context) {
    return context.filename;
}
exports.getFilename = getFilename;
/** @deprecated use `context.sourceCode.getScope(node) */
function getScope(context) {
    return context.getScope();
}
exports.getScope = getScope;
/** @deprecated use `context.sourceCode` */
function getSourceCode(context) {
    return context.sourceCode;
}
exports.getSourceCode = getSourceCode;
//# sourceMappingURL=context.js.map