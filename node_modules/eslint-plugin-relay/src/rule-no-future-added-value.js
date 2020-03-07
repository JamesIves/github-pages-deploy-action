/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = context => {
  function validateValue(node) {
    context.report(
      node,
      "Do not use `'%future added value'`. It represents any potential " +
        'value that the server might return in the future that the code ' +
        'should handle.'
    );
  }
  return {
    "Literal[value='%future added value']": validateValue,

    // StringLiteralTypeAnnotations that are not children of a default case
    ":not(SwitchCase[test=null] StringLiteralTypeAnnotation)StringLiteralTypeAnnotation[value='%future added value']": validateValue
  };
};
