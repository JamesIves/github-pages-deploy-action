"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBranch = exports.deploy = exports.init = void 0;
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const git_1 = require("./git");
Object.defineProperty(exports, "deploy", { enumerable: true, get: function () { return git_1.deploy; } });
Object.defineProperty(exports, "generateBranch", { enumerable: true, get: function () { return git_1.generateBranch; } });
Object.defineProperty(exports, "init", { enumerable: true, get: function () { return git_1.init; } });
const util_1 = require("./util");
/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
function run(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = constants_1.Status.RUNNING;
        try {
            core_1.info('Checking configuration and starting deployment… 🚦');
            const settings = Object.assign(Object.assign({}, constants_1.action), configuration);
            // Defines the repository paths and token types.
            settings.repositoryPath = util_1.generateRepositoryPath(settings);
            settings.tokenType = util_1.generateTokenType(settings);
            yield git_1.init(settings);
            status = yield git_1.deploy(settings);
        }
        catch (error) {
            status = constants_1.Status.FAILED;
            core_1.setFailed(error.message);
        }
        finally {
            core_1.info(`${status === constants_1.Status.FAILED
                ? 'Deployment Failed ❌'
                : status === constants_1.Status.SUCCESS
                    ? 'Completed Deployment Successfully! ✅'
                    : 'There is nothing to commit. Exiting early… 📭'}`);
            core_1.exportVariable('DEPLOYMENT_STATUS', status);
        }
    });
}
exports.default = run;
