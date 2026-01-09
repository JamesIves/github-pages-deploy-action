"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCommand = issueCommand;
exports.issue = issue;
const os = __importStar(require("os"));
const utils_1 = require("./utils");
/**
 * Issues a command to the GitHub Actions runner
 *
 * @param command - The command name to issue
 * @param properties - Additional properties for the command (key-value pairs)
 * @param message - The message to include with the command
 * @remarks
 * This function outputs a specially formatted string to stdout that the Actions
 * runner interprets as a command. These commands can control workflow behavior,
 * set outputs, create annotations, mask values, and more.
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * @example
 * ```typescript
 * // Issue a warning annotation
 * issueCommand('warning', {}, 'This is a warning message');
 * // Output: ::warning::This is a warning message
 *
 * // Set an environment variable
 * issueCommand('set-env', { name: 'MY_VAR' }, 'some value');
 * // Output: ::set-env name=MY_VAR::some value
 *
 * // Add a secret mask
 * issueCommand('add-mask', {}, 'secretValue123');
 * // Output: ::add-mask::secretValue123
 * ```
 *
 * @internal
 * This is an internal utility function that powers the public API functions
 * such as setSecret, warning, error, and exportVariable.
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return (0, utils_1.toCommandValue)(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return (0, utils_1.toCommandValue)(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map