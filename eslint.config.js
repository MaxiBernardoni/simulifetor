const { defineConfig, globalIgnores } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'node_modules/*', 'scripts/*']),
  expo,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'react-hooks/exhaustive-deps': 'warn',
      // Falso positivo del patrón habitual useRef(new Animated.Value(..)).current
      'react-hooks/refs': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);
