module.exports = {
  parser: 'babel-eslint',
  plugins: ['flowtype', 'github'],
  rules: {
    'flowtype/define-flow-type': 'error',
    'flowtype/require-valid-file-annotation': ['error', 'always', {annotationStyle: 'block'}],
    'flowtype/use-flow-type': 'error',
    'flowtype/no-flow-fix-me-comments': 'error',
    'flowtype/no-primitive-constructor-types': 'error',
    'flowtype/no-weak-types': 'error',
    'github/no-flow-weak': 'error',
    'github/no-noflow': 'error'
  }
}
