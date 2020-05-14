"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var mkdirp = require("mkdirp");
var path_1 = require("path");
var compiler_utils_1 = require("./compiler-utils");
var language_service_1 = require("./language-service");
var transpiler_1 = require("./transpiler");
function updateOutput(outputText, normalizedFileName, sourceMap, getExtension) {
    var base = path_1.basename(normalizedFileName);
    var base64Map = Buffer.from(updateSourceMap(sourceMap, normalizedFileName), 'utf8').toString('base64');
    var sourceMapContent = "data:application/json;charset=utf-8;base64," + base64Map;
    var sourceMapLength = (base + ".map").length + (getExtension(normalizedFileName).length - path_1.extname(normalizedFileName).length);
    return outputText.slice(0, -sourceMapLength) + sourceMapContent;
}
var updateSourceMap = function (sourceMapText, normalizedFileName) {
    var sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = normalizedFileName;
    sourceMap.sources = [normalizedFileName];
    delete sourceMap.sourceRoot;
    return JSON.stringify(sourceMap);
};
var compileAndCacheResult = function (memoryCache, compileFn, getExtension, logger) { return function (code, fileName, lineOffset) {
    logger.debug({ fileName: fileName }, 'compileAndCacheResult(): get compile output');
    var _a = __read(compileFn(code, fileName, lineOffset), 2), value = _a[0], sourceMap = _a[1];
    var output = updateOutput(value, fileName, sourceMap, getExtension);
    memoryCache.files.set(fileName, __assign(__assign({}, memoryCache.files.get(fileName)), { output: output }));
    return output;
}; };
exports.createCompilerInstance = function (configs) {
    var logger = configs.logger.child({ namespace: 'ts-compiler' });
    var compilerOptions = configs.parsedTsConfig.options, tsJest = configs.tsJest;
    var cacheDir = configs.tsCacheDir;
    var ts = configs.compilerModule;
    var extensions = ['.ts', '.tsx'];
    var memoryCache = {
        files: new Map(),
        resolvedModules: Object.create(null),
    };
    if (compilerOptions.allowJs) {
        extensions.push('.js');
        extensions.push('.jsx');
    }
    if (cacheDir) {
        mkdirp.sync(cacheDir);
        try {
            var fsMemoryCache = fs_1.readFileSync(compiler_utils_1.getResolvedModulesCache(cacheDir), 'utf-8');
            memoryCache.resolvedModules = JSON.parse(fsMemoryCache);
        }
        catch (e) { }
    }
    configs.parsedTsConfig.fileNames.forEach(function (fileName) {
        memoryCache.files.set(fileName, {
            version: 0,
        });
    });
    var getExtension = compilerOptions.jsx === ts.JsxEmit.Preserve
        ? function (path) { return (/\.[tj]sx$/.test(path) ? '.jsx' : '.js'); }
        : function (_) { return '.js'; };
    var compilerInstance;
    if (!tsJest.isolatedModules) {
        compilerInstance = language_service_1.initializeLanguageServiceInstance(configs, memoryCache, logger);
    }
    else {
        compilerInstance = transpiler_1.initializeTranspilerInstance(configs, memoryCache, logger);
    }
    var compile = compileAndCacheResult(memoryCache, compilerInstance.compileFn, getExtension, logger);
    return { cwd: configs.cwd, compile: compile, program: compilerInstance.program };
};
