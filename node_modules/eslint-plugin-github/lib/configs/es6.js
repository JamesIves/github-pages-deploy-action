module.exports = {
  parserOptions: {
    ecmaFeatures: {
      ecmaVersion: 6
    },
    sourceType: 'module'
  },
  env: {
    es6: true
  },
  plugins: ['github', 'import'],
  rules: {
    'github/array-foreach': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/first': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-absolute-path': 'error',
    'import/no-anonymous-default-export': [
      'error',
      {
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowArray: true,
        allowArrowFunction: false,
        allowLiteral: true,
        allowObject: true
      }
    ],
    'import/no-deprecated': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-as-default': 'error',
    'import/no-namespace': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts']
      }
    }
  },
  extends: [require.resolve('./recommended')]
}
