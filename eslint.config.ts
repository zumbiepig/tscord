import eslint from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.eslintRecommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		ignores: ['dist/'],
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
		},
	},
);
