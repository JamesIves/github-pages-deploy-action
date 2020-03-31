module.exports = {
  plugins: ['github'],
  rules: {
    'github/authenticity-token': 'error',
    'github/js-class-name': 'error',
    'github/no-d-none': 'error',
    'github/no-dataset': 'error',
    'github/no-then': 'error'
  },
  extends: [require.resolve('./recommended'), require.resolve('./es6'), require.resolve('./browser')]
}
