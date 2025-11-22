import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'build', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node, // ✅ allows process, require, module
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Base Recommended Rules
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // ✅ Turn off PropTypes (because you use JS or TS, not PropTypes)
      'react/prop-types': 'off',

      // ✅ Remove unused vars warnings completely
      'no-unused-vars': 'off',

      // ✅ Prevent "missing dependency" spam
      'react-hooks/exhaustive-deps': 'warn',

      // ✅ Fixes "require is not defined" (common in Tailwind config)
      'no-undef': 'off',

      // Optional: Remove blank target errors
      'react/jsx-no-target-blank': 'off',

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
