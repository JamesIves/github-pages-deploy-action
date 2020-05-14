"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTranspilerInstance = function (configs, memoryCache, logger) {
    logger.debug('initializeTranspilerInstance(): create typescript compiler');
    var _a = configs.parsedTsConfig, options = _a.options, fileNames = _a.fileNames;
    var ts = configs.compilerModule;
    var program = ts.createProgram(fileNames, options);
    var updateFileInCache = function (contents, filePath) {
        var file = memoryCache.files.get(filePath);
        if (file && file.text !== contents) {
            file.version++;
            file.text = contents;
        }
    };
    return {
        compileFn: function (code, fileName) {
            updateFileInCache(code, fileName);
            logger.debug({ fileName: fileName }, 'compileFn(): compiling as isolated module');
            var result = ts.transpileModule(code, {
                fileName: fileName,
                transformers: configs.tsCustomTransformers,
                compilerOptions: options,
                reportDiagnostics: configs.shouldReportDiagnostic(fileName),
            });
            if (result.diagnostics && configs.shouldReportDiagnostic(fileName)) {
                configs.raiseDiagnostics(result.diagnostics, fileName, logger);
            }
            return [result.outputText, result.sourceMapText];
        },
        program: program,
    };
};
