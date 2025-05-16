import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['coverage', 'dist', 'dist-proxy', 'dist-types', '**/*.d.ts']
	},
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			globals: globals.browser
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'prefer-const': 'off'
		}
	}
];
