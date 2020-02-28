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
const git_1 = require("./git");
exports.init = git_1.init;
exports.deploy = git_1.deploy;
exports.generateBranch = git_1.generateBranch;
const constants_1 = require("./constants");
const util_1 = require("./util");
/** Initializes and runs the action. */
function run(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        let errorState = false;
        const settings = Object.assign(Object.assign({}, constants_1.action), configuration);
        // Defines the repository paths and token types.
        settings.repositoryPath = util_1.generateRepositoryPath(settings);
        settings.tokenType = util_1.generateTokenType(settings);
        try {
            yield git_1.init(settings);
            yield git_1.deploy(settings);
        }
        catch (error) {
            errorState = true;
            core_1.setFailed(error);
        }
        finally {
            console.log(`${errorState
                ? "Deployment Failed ❌"
                : "Completed Deployment Successfully! ✅"}`);
        }
    });
}
exports.default = run;
