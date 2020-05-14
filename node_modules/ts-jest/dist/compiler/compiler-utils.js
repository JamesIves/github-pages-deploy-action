"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var micromatch = require("micromatch");
var path_1 = require("path");
var sha1_1 = require("../util/sha1");
function getResolvedModulesCache(cacheDir) {
    return path_1.join(cacheDir, sha1_1.sha1('ts-jest-resolved-modules', '\x00'));
}
exports.getResolvedModulesCache = getResolvedModulesCache;
function cacheResolvedModules(fileName, fileContent, memoryCache, program, cacheDir, logger) {
    var importReferences = program.getSourceFile(fileName).imports;
    if (importReferences.length) {
        logger.debug({ fileName: fileName }, 'cacheResolvedModules(): get resolved modules');
        memoryCache.resolvedModules[fileName] = Object.create(null);
        memoryCache.resolvedModules[fileName].modulePaths = importReferences
            .filter(function (importReference) { var _a; return (_a = importReference.parent.parent.resolvedModules) === null || _a === void 0 ? void 0 : _a.get(importReference.text); })
            .map(function (importReference) {
            return path_1.normalize(importReference.parent.parent.resolvedModules.get(importReference.text)
                .resolvedFileName);
        })
            .reduce(function (a, b) { return a.concat(b); }, []);
        memoryCache.resolvedModules[fileName].testFileContent = fileContent;
        fs_1.writeFileSync(getResolvedModulesCache(cacheDir), JSON.stringify(memoryCache.resolvedModules));
    }
}
exports.cacheResolvedModules = cacheResolvedModules;
function isTestFile(testMatchPatterns, fileName) {
    return testMatchPatterns.some(function (pattern) {
        return typeof pattern === 'string' ? micromatch.isMatch(fileName, pattern) : pattern.test(fileName);
    });
}
exports.isTestFile = isTestFile;
