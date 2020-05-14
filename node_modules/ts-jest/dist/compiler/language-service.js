"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bs_logger_1 = require("bs-logger");
var path_1 = require("path");
var constants_1 = require("../constants");
var messages_1 = require("../util/messages");
var compiler_utils_1 = require("./compiler-utils");
var memoize = require("lodash.memoize");
function doTypeChecking(configs, fileName, service, logger) {
    if (configs.shouldReportDiagnostic(fileName)) {
        var diagnostics = service.getSemanticDiagnostics(fileName).concat(service.getSyntacticDiagnostics(fileName));
        configs.raiseDiagnostics(diagnostics, fileName, logger);
    }
}
exports.initializeLanguageServiceInstance = function (configs, memoryCache, logger) {
    var _a;
    logger.debug('initializeLanguageServiceInstance(): create typescript compiler');
    var ts = configs.compilerModule;
    var cwd = configs.cwd;
    var cacheDir = configs.tsCacheDir;
    var _b = configs.parsedTsConfig, options = _b.options, fileNames = _b.fileNames;
    var serviceHostTraceCtx = (_a = {
            namespace: 'ts:serviceHost',
            call: null
        },
        _a[bs_logger_1.LogContexts.logLevel] = bs_logger_1.LogLevels.trace,
        _a);
    function isFileInCache(fileName) {
        return memoryCache.files.has(fileName) && memoryCache.files.get(fileName).version !== 0;
    }
    var projectVersion = 1;
    var updateMemoryCache = function (contents, fileName) {
        logger.debug({ fileName: fileName }, 'updateMemoryCache(): update memory cache for language service');
        var shouldIncrementProjectVersion = false;
        var hit = isFileInCache(fileName);
        if (!hit) {
            memoryCache.files.set(fileName, {
                text: contents,
                version: 1,
            });
            shouldIncrementProjectVersion = true;
        }
        else {
            var previousContents = memoryCache.files.get(fileName).text;
            if (previousContents !== contents) {
                memoryCache.files.set(fileName, {
                    text: contents,
                    version: memoryCache.files.get(fileName).version + 1,
                });
                if (hit)
                    shouldIncrementProjectVersion = true;
            }
            if (!fileNames.includes(fileName)) {
                shouldIncrementProjectVersion = true;
            }
        }
        if (shouldIncrementProjectVersion)
            projectVersion++;
    };
    var serviceHost = {
        getProjectVersion: function () { return String(projectVersion); },
        getScriptFileNames: function () { return __spread(memoryCache.files.keys()); },
        getScriptVersion: function (fileName) {
            var normalizedFileName = path_1.normalize(fileName);
            var version = memoryCache.files.get(normalizedFileName).version;
            return version === undefined ? undefined : String(version);
        },
        getScriptSnapshot: function (fileName) {
            var _a;
            var normalizedFileName = path_1.normalize(fileName);
            var hit = memoryCache.files.has(normalizedFileName) && memoryCache.files.get(normalizedFileName).version !== 0;
            logger.trace({ normalizedFileName: normalizedFileName, cacheHit: hit }, 'getScriptSnapshot():', 'cache', hit ? 'hit' : 'miss');
            if (!hit) {
                memoryCache.files.set(normalizedFileName, {
                    text: ts.sys.readFile(normalizedFileName),
                    version: 1,
                });
            }
            var contents = (_a = memoryCache.files.get(normalizedFileName)) === null || _a === void 0 ? void 0 : _a.text;
            if (contents === undefined)
                return;
            return ts.ScriptSnapshot.fromString(contents);
        },
        fileExists: memoize(ts.sys.fileExists),
        readFile: logger.wrap(serviceHostTraceCtx, 'readFile', memoize(ts.sys.readFile)),
        readDirectory: memoize(ts.sys.readDirectory),
        getDirectories: memoize(ts.sys.getDirectories),
        directoryExists: memoize(ts.sys.directoryExists),
        realpath: memoize(ts.sys.realpath),
        getNewLine: function () { return constants_1.LINE_FEED; },
        getCurrentDirectory: function () { return cwd; },
        getCompilationSettings: function () { return options; },
        getDefaultLibFileName: function () { return ts.getDefaultLibFilePath(options); },
        getCustomTransformers: function () { return configs.tsCustomTransformers; },
    };
    logger.debug('initializeLanguageServiceInstance(): creating language service');
    var service = ts.createLanguageService(serviceHost, ts.createDocumentRegistry());
    return {
        compileFn: function (code, fileName) {
            logger.debug({ fileName: fileName }, 'compileFn(): compiling using language service');
            updateMemoryCache(code, fileName);
            var output = service.getEmitOutput(fileName);
            logger.debug({ fileName: fileName }, 'compileFn(): computing diagnostics using language service');
            doTypeChecking(configs, fileName, service, logger);
            if (cacheDir) {
                if (compiler_utils_1.isTestFile(configs.testMatchPatterns, fileName)) {
                    compiler_utils_1.cacheResolvedModules(fileName, code, memoryCache, service.getProgram(), cacheDir, logger);
                }
                else {
                    Object.entries(memoryCache.resolvedModules)
                        .filter(function (entry) {
                        return entry[1].modulePaths.find(function (modulePath) { return modulePath === fileName; }) && !memoryCache.files.has(entry[0]);
                    })
                        .forEach(function (entry) {
                        var testFileName = entry[0];
                        var testFileContent = entry[1].testFileContent;
                        logger.debug({ fileName: fileName }, 'compileFn(): computing diagnostics for test file that imports this module using language service');
                        updateMemoryCache(testFileContent, testFileName);
                        doTypeChecking(configs, testFileName, service, logger);
                    });
                }
            }
            if (output.emitSkipped) {
                throw new TypeError(path_1.relative(cwd, fileName) + ": Emit skipped for language service");
            }
            if (!output.outputFiles.length) {
                throw new TypeError(messages_1.interpolate("Unable to require `.d.ts` file for file: {{file}}.\nThis is usually the result of a faulty configuration or import. Make sure there is a `.js`, `.json` or another executable extension available alongside `{{file}}`.", {
                    file: path_1.basename(fileName),
                }));
            }
            return [output.outputFiles[1].text, output.outputFiles[0].text];
        },
        program: service.getProgram(),
    };
};
