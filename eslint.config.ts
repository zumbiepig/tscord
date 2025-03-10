import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import eslintPluginN from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default [
	eslint.configs.recommended,
	includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	eslintPluginN.configs['flat/recommended'],
	unicorn.configs.all,
	{
		ignores: ['./eslint.config.ts'],
		languageOptions: {
			parserOptions: {
				projectService: { allowDefaultProject: ['./eslint.config.ts'] },
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: { 'simple-import-sort': simpleImportSort },
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			'unicorn/prevent-abbreviations': 'off',
			'unicorn/string-content': ['error', { patterns: { '…': '…', '→': '→' } }],
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
		},
	},
] satisfies FlatConfig.ConfigFile;
