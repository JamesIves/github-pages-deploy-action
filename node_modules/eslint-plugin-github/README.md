# eslint-plugin-github

## Installation

```sh
$ npm install --save-dev eslint
$ npm install --save-dev eslint-plugin-github
```

Run initialization wizard.

```sh
$ node_modules/.bin/eslint-github-init
```

Set up `npm run lint` script.

```json
{
  "private": true,
  "scripts": {
    "lint": "github-lint"
  }
}
```

The `github-lint` command will run `eslint`, `flow` and flow coverage checking depending on your project configuration.
