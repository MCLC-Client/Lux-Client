import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
    { ignores: ['dist', 'node_modules', 'release', '**/*.d.ts'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.2' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': 'off',
            'react/prop-types': 'off',
            'no-unused-vars': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-control-regex': 'off',
            'no-case-declarations': 'off',
            'no-useless-catch': 'off',
            'no-useless-escape': 'off',
            'react/no-unescaped-entities': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/static-components': 'off',
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.2' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': 'off',
            'react/prop-types': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-control-regex': 'off',
            'no-case-declarations': 'off',
            'no-useless-catch': 'off',
            'no-useless-escape': 'off',
            'react/no-unescaped-entities': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/static-components': 'off',
        },
    },
];
