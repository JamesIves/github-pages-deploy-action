# eslint-plugin-relay [![Build Status](https://travis-ci.org/relayjs/eslint-plugin-relay.svg?branch=master)](https://travis-ci.org/relayjs/eslint-plugin-relay) [![npm version](https://badge.fury.io/js/eslint-plugin-relay.svg)](http://badge.fury.io/js/eslint-plugin-relay)

`eslint-plugin-relay` is a plugin for [ESLint](http://eslint.org/) to catch common problems in code using [Relay](https://facebook.github.io/relay/) early.

## Install

`npm i --save-dev eslint-plugin-relay`

## How To Use

1.  Add `"relay"` to your eslint `plugins` section.
2.  Add the relay rules such as `"relay/graphql-syntax": "error"` to your eslint `rules` section, see the example for all rules.

Example .eslintrc.js:

```js
module.exports = {
  // Other eslint properties here
  rules: {
    'relay/graphql-syntax': 'error',
    'relay/compat-uses-vars': 'warn',
    'relay/graphql-naming': 'error',
    'relay/generated-flow-types': 'warn',
    'relay/no-future-added-value': 'warn',
    'relay/unused-fields': 'warn'
  },
  plugins: ['relay']
};
```

You can also enable all the recommended or strict rules at once.
Add `plugin:relay/recommended` or `plugin:relay/strict` in `extends`:

```js
{
  "extends": [
    "plugin:relay/recommended"
  ]
}
```

## Contribute

We actively welcome pull requests, learn how to [contribute](./CONTRIBUTING.md).

## License

`eslint-plugin-relay` is [MIT licensed](./LICENSE).
