module.exports = {
  rules: {
    'array-foreach': require('./rules/array-foreach'),
    'async-currenttarget': require('./rules/async-currenttarget'),
    'async-preventdefault': require('./rules/async-preventdefault'),
    'authenticity-token': require('./rules/authenticity-token'),
    'get-attribute': require('./rules/get-attribute'),
    'js-class-name': require('./rules/js-class-name'),
    'no-blur': require('./rules/no-blur'),
    'no-d-none': require('./rules/no-d-none'),
    'no-dataset': require('./rules/no-dataset'),
    'no-implicit-buggy-globals': require('./rules/no-implicit-buggy-globals'),
    'no-innerText': require('./rules/no-innerText'),
    'no-then': require('./rules/no-then'),
    'unescaped-html-literal': require('./rules/unescaped-html-literal'),
    'no-useless-passive': require('./rules/no-useless-passive'),
    'prefer-observers': require('./rules/prefer-observers'),
    'require-passive-events': require('./rules/require-passive-events')
  },
  configs: {
    internal: require('./configs/internal'),
    browser: require('./configs/browser'),
    recommended: require('./configs/recommended'),
    typescript: require('./configs/typescript')
  }
}
