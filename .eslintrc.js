module.exports = {
  extends: 'universe/native',
  settings: {
    react: {
      version: 'detect'
    }
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'no-case-declarations': 'error',
    'justinanastos/switch-braces': 'error',
    'justinanastos/import-destructuring-spacing': 'warn',
    'justinanastos/shortcuts': 'warn',
    'justinanastos/shortcuts': [ 'warn', { favorShorthand: true } ],
    'react-hooks/exhaustive-deps': 'warn',
    'import/default': 'error',
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
  },
  plugins: ['react-hooks', 'import', 'justinanastos']
}