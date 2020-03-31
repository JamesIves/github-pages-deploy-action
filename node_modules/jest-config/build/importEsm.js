'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

function _url() {
  const data = require('url');

  _url = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// this is in a separate file so that node 8 don't explode with a syntax error.
// Remove this file when we drop support for Node 8
var _default = (
  specifier // node `import()` supports URL, but TypeScript doesn't know that
) => import((0, _url().pathToFileURL)(specifier).href);

exports.default = _default;
