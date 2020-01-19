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
/** Initializes and runs the action. */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield git_1.init();
            yield git_1.deploy();
        }
        catch (error) {
            /* istanbul ignore next */
            console.log("The deployment encountered an error. ❌");
            /* istanbul ignore next */
            core_1.setFailed(error);
        }
        finally {
            console.log("Completed Deployment ✅");
        }
    });
}
exports.default = main;
// Init
main();
