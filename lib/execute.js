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
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
// Stores the output from execute.
let output;
/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 * @param {String} cmd = The command to execute.
 * @param {String} cwd - The current working directory.
 * @returns {Promise} - The output from the command.
 */
function execute(cmd, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        output = "";
        yield exec_1.exec(cmd, [], {
            // Silences the input unless the INPUT_DEBUG flag is set.
            silent: core_1.getInput("DEBUG") ? false : true,
            cwd,
            listeners: {
                stdout
            }
        });
        return Promise.resolve(output);
    });
}
exports.execute = execute;
function stdout(data) {
    output += data.toString().trim();
}
exports.stdout = stdout;
