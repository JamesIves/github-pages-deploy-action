'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

function _chalk() {
  const data = _interopRequireDefault(require('chalk'));

  _chalk = function () {
    return data;
  };

  return data;
}

function _jestMessageUtil() {
  const data = require('jest-message-util');

  _jestMessageUtil = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _default = (
  root,
  verbose,
  buffer, // TODO: make mandatory and take Config.ProjectConfig in 26
  config = {
    rootDir: root,
    testMatch: []
  }
) => {
  const TITLE_INDENT = verbose ? '  ' : '    ';
  const CONSOLE_INDENT = TITLE_INDENT + '  ';
  const logEntries = buffer.reduce((output, {type, message, origin}) => {
    message = message
      .split(/\n/)
      .map(line => CONSOLE_INDENT + line)
      .join('\n');
    let typeMessage = 'console.' + type;
    let noStackTrace = true;
    let noCodeFrame = true;

    if (type === 'warn') {
      message = _chalk().default.yellow(message);
      typeMessage = _chalk().default.yellow(typeMessage);
      noStackTrace = false;
      noCodeFrame = false;
    } else if (type === 'error') {
      message = _chalk().default.red(message);
      typeMessage = _chalk().default.red(typeMessage);
      noStackTrace = false;
      noCodeFrame = false;
    }

    const options = {
      noCodeFrame,
      noStackTrace
    };
    const formattedStackTrace = (0, _jestMessageUtil().formatStackTrace)(
      origin,
      config,
      options
    );
    return (
      output +
      TITLE_INDENT +
      _chalk().default.dim(typeMessage) +
      '\n' +
      message.trimRight() +
      '\n' +
      _chalk().default.dim(formattedStackTrace.trimRight()) +
      '\n\n'
    );
  }, '');
  return logEntries.trimRight() + '\n';
};

exports.default = _default;
