import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			exclude: ['dist', 'demo.ts', 'eslint.config.mjs', '**/*.spec.ts', 'vitest.config.mts']
		}
	}
});
