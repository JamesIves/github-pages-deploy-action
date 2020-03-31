"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function batchedSingleLineTests(options) {
    // eslint counts lines from 1
    const lineOffset = options.code.startsWith('\n') ? 2 : 1;
    const output = 'output' in options && options.output
        ? options.output.trim().split('\n')
        : null;
    return options.code
        .trim()
        .split('\n')
        .map((code, i) => {
        var _a;
        const lineNum = i + lineOffset;
        const errors = 'errors' in options
            ? options.errors.filter(e => e.line === lineNum)
            : [];
        const returnVal = Object.assign(Object.assign({}, options), { code, errors: errors.map(e => (Object.assign(Object.assign({}, e), { line: 1 }))) });
        if ((_a = output) === null || _a === void 0 ? void 0 : _a[i]) {
            return Object.assign(Object.assign({}, returnVal), { output: output[i] });
        }
        return returnVal;
    });
}
exports.batchedSingleLineTests = batchedSingleLineTests;
//# sourceMappingURL=batchedSingleLineTests.js.map