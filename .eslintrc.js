module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'import'],
  rules: {
    'react/prop-types': 'off',
    'import/no-unresolved': 'error', // Explicitly catch bad/missing imports
    'react/no-unescaped-entities': 'off',
  },
  overrides: [
    {
      files: ['vite.config.js'], // Apply these rules only to vite.config.js
      parserOptions: {
        sourceType: 'script', // Treat it as a CommonJS script
      },
      rules: {
        'import/no-unresolved': 'off', // Turn off import resolution checks for this file
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
};