"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var semver_1 = require("semver");
var get_package_version_1 = require("./get-package-version");
var logger_1 = require("./logger");
var messages_1 = require("./messages");
var logger = logger_1.rootLogger.child({ namespace: 'versions' });
exports.VersionCheckers = {
    jest: createVersionChecker('jest', ">=25 <26"),
    typescript: createVersionChecker('typescript', ">=3.4 <4"),
    babelJest: createVersionChecker('babel-jest', ">=25 <26"),
    babelCore: createVersionChecker('@babel/core', ">=7.0.0-beta.0 <8"),
};
function checkVersion(name, expectedRange, action) {
    if (action === void 0) { action = 'warn'; }
    var version = get_package_version_1.getPackageVersion(name);
    var success = !!version && semver_1.satisfies(version, expectedRange);
    logger.debug({
        actualVersion: version,
        expectedVersion: expectedRange,
    }, 'checking version of %s: %s', name, success ? 'OK' : 'NOT OK');
    if (!action || success)
        return success;
    var message = messages_1.interpolate(version ? "Version {{actualVersion}} of {{module}} installed has not been tested with ts-jest. If you're experiencing issues, consider using a supported version ({{expectedVersion}}). Please do not report issues in ts-jest if you are using unsupported versions." : "Module {{module}} is not installed. If you're experiencing issues, consider installing a supported version ({{expectedVersion}}).", {
        module: name,
        actualVersion: version || '??',
        expectedVersion: rangeToHumanString(expectedRange),
    });
    if (action === 'warn') {
        logger.warn(message);
    }
    else if (action === 'throw') {
        logger.fatal(message);
        throw new RangeError(message);
    }
    return success;
}
function rangeToHumanString(versionRange) {
    return new semver_1.Range(versionRange).toString();
}
function createVersionChecker(moduleName, expectedVersion) {
    var memo;
    var warn = function () {
        if (memo !== undefined)
            return memo;
        return (memo = checkVersion(moduleName, expectedVersion, 'warn'));
    };
    var raise = function () { return checkVersion(moduleName, expectedVersion, 'throw'); };
    return {
        raise: raise,
        warn: warn,
        forget: function () {
            memo = undefined;
        },
    };
}
