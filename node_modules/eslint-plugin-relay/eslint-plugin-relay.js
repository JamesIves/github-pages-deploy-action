/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = {
  rules: {
    'graphql-syntax': require('./src/rule-graphql-syntax'),
    'compat-uses-vars': require('./src/rule-compat-uses-vars'),
    'graphql-naming': require('./src/rule-graphql-naming'),
    'generated-flow-types': require('./src/rule-generated-flow-types'),
    'no-future-added-value': require('./src/rule-no-future-added-value'),
    'unused-fields': require('./src/rule-unused-fields'),
    'hook-required-argument': require('./src/rule-hook-required-argument')
  },
  configs: {
    recommended: {
      rules: {
        'relay/graphql-syntax': 'error',
        'relay/compat-uses-vars': 'warn',
        'relay/graphql-naming': 'error',
        'relay/generated-flow-types': 'warn',
        'relay/no-future-added-value': 'warn',
        'relay/unused-fields': 'warn',
        'relay/hook-required-argument': 'warn'
      }
    },
    strict: {
      rules: {
        'relay/graphql-syntax': 'error',
        'relay/compat-uses-vars': 'error',
        'relay/graphql-naming': 'error',
        'relay/generated-flow-types': 'error',
        'relay/no-future-added-value': 'error',
        'relay/unused-fields': 'error',
        'relay/hook-required-argument': 'error'
      }
    }
  }
};
