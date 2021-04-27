module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'no-console': 'error',
  },
};
