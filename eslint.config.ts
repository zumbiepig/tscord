import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginN from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
	includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
	eslint.configs.recommended,
	typescriptEslint.configs.strictTypeChecked,
	typescriptEslint.configs.stylisticTypeChecked,
	eslintPluginN.configs['flat/recommended'],
	unicorn.configs.all,
	eslintConfigPrettier,
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

			'n/no-unpublished-import': 'off', // this is so buggy

			'unicorn/prevent-abbreviations': 'off',
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
		},
	},
);
