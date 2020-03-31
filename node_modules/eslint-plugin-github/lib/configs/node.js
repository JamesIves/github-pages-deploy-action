module.exports = {
  parser: 'babel-eslint',
  env: {
    node: true
  },
  plugins: ['github'],
  rules: {
    'no-console': 'off'
  },
  extends: [require.resolve('./recommended')]
}
