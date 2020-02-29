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
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const git_1 = require("./git");
exports.deploy = git_1.deploy;
exports.generateBranch = git_1.generateBranch;
exports.init = git_1.init;
const util_1 = require("./util");
/** Initializes and runs the action. */
function run(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        let errorState = false;
        try {
            console.log("Checking configuration and starting deployment...🚦");
            const settings = Object.assign(Object.assign({}, constants_1.action), configuration);
            // Defines the repository paths and token types.
            settings.repositoryPath = util_1.generateRepositoryPath(settings);
            settings.tokenType = util_1.generateTokenType(settings);
            if (settings.debug) {
                // Sets the debug flag if passed as an arguement.
                core_1.exportVariable("DEBUG_DEPLOY_ACTION", "debug");
            }
            yield git_1.init(settings);
            yield git_1.deploy(settings);
        }
        catch (error) {
            errorState = true;
            core_1.setFailed(error.message);
        }
        finally {
            console.log(`${errorState
                ? "Deployment Failed ❌"
                : "Completed Deployment Successfully! ✅"}`);
        }
    });
}
exports.default = run;
