import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
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
	stylistic.configs.customize({ indent: 'tab', semi: true, braceStyle: '1tbs' }),
	eslintPluginN.configs['flat/recommended'],
	unicorn.configs.all,
	{
		languageOptions: { parserOptions: { projectService: { allowDefaultProject: ['eslint.config.ts'] }, tsconfigRootDir: import.meta.dirname } },
		plugins: { 'simple-import-sort': simpleImportSort },
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'n/callback-return': 'error', 'n/exports-style': 'error', 'n/global-require': 'error', 'n/handle-callback-err': 'error', 'n/no-callback-literal': 'error', 'n/no-hide-core-modules': 'error', 'n/no-mixed-requires': 'error', 'n/no-new-require': 'error', 'n/no-path-concat': 'error', 'n/no-process-env': 'error', 'n/no-restricted-import': 'error', 'n/no-restricted-require': 'error', 'n/no-sync': 'error', 'n/prefer-global/buffer': 'error', 'n/prefer-global/console': 'error', 'n/prefer-global/process': 'error', 'n/prefer-global/text-decoder': 'error', 'n/prefer-global/text-encoder': 'error', 'n/prefer-global/url': 'error', 'n/prefer-global/url-search-params': 'error', 'n/prefer-node-protocol': 'error', 'n/prefer-promises/dns': 'error', 'n/prefer-promises/fs': 'error', 'n/shebang': 'error',

			'unicorn/prevent-abbreviations': 'off',
			// eslint-disable-next-line unicorn/string-content
			'unicorn/string-content': ['error', { patterns: { '\\.\\.\\.': '…', '->': '→', '^http:\\/\\/': String.raw`^https:\/\/` } }],
			'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],

		},
	},
] satisfies FlatConfig.ConfigFile;
