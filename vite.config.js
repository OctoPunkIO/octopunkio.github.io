import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 3000,
		allowedHosts: true,
		hmr: {
			host: 'localhost',
			port: 3000,
			clientPort: 3000
		},
		watch: {
			usePolling: true,
			interval: 1000
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test-setup.js']
	}
});
