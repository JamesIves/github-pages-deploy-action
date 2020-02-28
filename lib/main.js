"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("./lib"));
const constants_1 = require("./constants");
// Runs the action within the GitHub actions environment.
lib_1.default(constants_1.action);
