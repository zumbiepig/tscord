import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import type { Linter } from 'eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default [
	eslint.configs.recommended,
	includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	stylistic.configs.customize({ indent: 'tab', semi: true, braceStyle: '1tbs' }),
	// TODO: unicorn.configs.all,
	unicorn.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.ts'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			// "@typescript-eslint/no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
		},
	},
] satisfies Linter.Config[];
