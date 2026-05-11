import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md']
		})
	],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false
		}),
		prerender: {
			// /blog/[slug] returns no entries when blog/ is empty. Don't fail the
			// build over that — the empty state is intentional.
			handleUnseenRoutes: 'ignore'
		}
	}
};

export default config;
