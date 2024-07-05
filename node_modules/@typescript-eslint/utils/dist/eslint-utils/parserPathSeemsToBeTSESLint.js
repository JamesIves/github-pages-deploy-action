"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserPathSeemsToBeTSESLint = parserPathSeemsToBeTSESLint;
function parserPathSeemsToBeTSESLint(parserPath) {
    return /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parserPath);
}
//# sourceMappingURL=parserPathSeemsToBeTSESLint.js.map