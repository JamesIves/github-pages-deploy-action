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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stdout = exports.execute = void 0;
const exec_1 = require("@actions/exec");
const buffer_1 = __importDefault(require("buffer"));
let output = '';
/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 * @param {boolean} silent - Determines if the in/out should be silenced or not.
 */
function execute(cmd, cwd, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        output = '';
        yield (0, exec_1.exec)(cmd, [], {
            // Silences the input unless the INPUT_DEBUG flag is set.
            silent,
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
    const dataString = data.toString().trim();
    if (output.length + dataString.length < buffer_1.default.constants.MAX_STRING_LENGTH) {
        output += dataString;
    }
}
exports.stdout = stdout;
