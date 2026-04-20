<script>
	import { marked } from 'marked';

	export let data;

	let toc = [];
	let activeId = '';

	// Custom renderer that collects TOC entries during parse
	function createRenderer() {
		const tocEntries = [];

		const renderer = {
			heading({ tokens, depth, text }) {
				const content = this.parser.parseInline(tokens);
				const slug = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

				// Collect h2/h3/h4 for TOC
				if (depth >= 2 && depth <= 4) {
					tocEntries.push({ level: depth, text, id: slug });
				}

				if (depth === 1 && text.includes('Octopunk')) {
					return `<h1 id="${slug}"><img src="/octopunk-icon.png" alt="" class="h1-logo" />${content}</h1>`;
				}
				return `<h${depth} id="${slug}">${content}</h${depth}>`;
			}
		};

		return { renderer, tocEntries };
	}

	function parseMarkdown(markdown) {
		const { renderer, tocEntries } = createRenderer();
		marked.use({ renderer });
		const html = marked.parse(markdown);
		toc = tocEntries;
		return html;
	}

	$: contentHtml = parseMarkdown(data.markdown);

	// Svelte action: runs when element is in DOM, re-runs on toc change
	function observeHeadings(node, tocItems) {
		let observer = null;

		function setup(items) {
			if (observer) observer.disconnect();
			if (!items || items.length === 0) return;

			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
						}
					});
				},
				{ rootMargin: '-20% 0px -80% 0px' }
			);

			items.forEach(item => {
				const el = node.querySelector(`#${CSS.escape(item.id)}`);
				if (el) observer.observe(el);
			});
		}

		setup(tocItems);

		return {
			update(newTocItems) {
				setup(newTocItems);
			},
			destroy() {
				if (observer) observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	<title>{data.meta.title || 'Documentation'} - Octopunk</title>
</svelte:head>

<div class="docs-page">
	<aside class="docs-sidebar">
		<div class="sidebar-header">
			<a href="/" class="back-link" title="Back to home">
				<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
					<path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"/>
				</svg>
			</a>
			<a href="/docs" class="sidebar-title">
				<img src="/octopunk-icon.png" alt="" class="sidebar-logo" />
				Documentation
			</a>
		</div>
		<nav class="sidebar-nav">
			{#each data.tree as item}
				{#if item.type === 'directory'}
					<div class="nav-section">
						<a href="/docs/{item.slug}" class="nav-section-title" class:active={data.slug === item.slug || data.slug === item.slug + '/index'}>
							{item.title}
						</a>
						{#if item.children.length > 0}
							<div class="nav-section-children">
								{#each item.children as child}
									{#if child.type === 'file'}
										<a href="/docs/{child.slug}" class="nav-link" class:active={data.slug === child.slug}>
											{child.title}
										</a>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<a href="/docs/{item.slug}" class="nav-link" class:active={data.slug === item.slug}>
						{item.title}
					</a>
				{/if}
			{/each}
		</nav>
	</aside>

	<main class="docs-content">
		<article class="prose" use:observeHeadings={toc}>
			{@html contentHtml}
		</article>
	</main>

	{#if toc.length > 0}
		<aside class="toc-sidebar">
			<nav class="toc">
				<h4 class="toc-title">On this page</h4>
				{#each toc as item}
					<a
						href="#{item.id}"
						class="toc-item level-{item.level}"
						class:active={activeId === item.id}
					>
						{item.text}
					</a>
				{/each}
			</nav>
		</aside>
	{/if}
</div>

<style>
	.docs-page {
		display: flex;
		min-height: 100vh;
		background: var(--color-bg-primary);
	}

	.docs-sidebar {
		width: 280px;
		flex-shrink: 0;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border-primary);
		padding: 24px 0;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 24px 16px;
		border-bottom: 1px solid var(--color-border-primary);
		margin-bottom: 16px;
	}

	.back-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		color: var(--color-text-secondary);
		transition: all 0.15s ease;
	}

	.back-link:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-tertiary);
	}

	.sidebar-title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 18px;
		font-weight: 600;
		color: var(--color-text-primary);
		text-decoration: none;
	}

	.sidebar-title:hover {
		color: #a855f7;
	}

	.sidebar-logo {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		padding: 1px;
		background: linear-gradient(
			90deg,
			#a855f7,
			#ec4899,
			#f97316,
			#eab308,
			#a855f7
		);
		background-size: 300% 100%;
		animation: gradient-flow 8s ease infinite;
		filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))
		        drop-shadow(0 0 12px rgba(236, 72, 153, 0.4));
	}

	.sidebar-nav {
		padding: 0 16px;
	}

	.nav-section {
		margin-bottom: 16px;
	}

	.nav-section-title {
		display: block;
		padding: 8px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
		text-decoration: none;
		border-radius: 6px;
		transition: background-color 0.15s ease;
	}

	.nav-section-title:hover {
		background: var(--color-bg-tertiary);
	}

	.nav-section-title.active {
		background: rgba(168, 85, 247, 0.15);
		color: #a855f7;
	}

	.nav-section-children {
		margin-left: 12px;
		padding-left: 12px;
		border-left: 1px solid var(--color-border-primary);
	}

	.nav-link {
		display: block;
		padding: 6px 8px;
		font-size: 14px;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: 6px;
		transition: all 0.15s ease;
	}

	.nav-link:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-tertiary);
	}

	.nav-link.active {
		color: #a855f7;
		background: rgba(168, 85, 247, 0.15);
	}

	.docs-content {
		flex: 1;
		padding: 48px 64px;
		max-width: 900px;
	}

	/* Prose styles for markdown content */
	.prose {
		color: var(--color-text-primary);
		line-height: 1.7;
	}

	.prose :global(h1) {
		display: flex;
		align-items: center;
		gap: 14px;
		font-size: 36px;
		font-weight: 700;
		margin-bottom: 24px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--color-border-primary);
	}

	.prose :global(h1 .h1-logo) {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		padding: 2px;
		margin: 0;
		border: none;
		box-shadow: none;
		background: linear-gradient(
			90deg,
			#a855f7,
			#ec4899,
			#f97316,
			#eab308,
			#a855f7
		);
		background-size: 300% 100%;
		animation: gradient-flow 8s ease infinite;
		filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))
		        drop-shadow(0 0 16px rgba(236, 72, 153, 0.4));
	}

	.prose :global(h2) {
		font-size: 28px;
		font-weight: 600;
		margin-top: 48px;
		margin-bottom: 16px;
	}

	.prose :global(h3) {
		font-size: 22px;
		font-weight: 600;
		margin-top: 32px;
		margin-bottom: 12px;
	}

	.prose :global(h4) {
		font-size: 18px;
		font-weight: 600;
		margin-top: 24px;
		margin-bottom: 8px;
	}

	.prose :global(p) {
		margin-bottom: 16px;
	}

	.prose :global(a) {
		color: #58a6ff;
		text-decoration: none;
	}

	.prose :global(a:hover) {
		text-decoration: underline;
	}

	.prose :global(code) {
		background: var(--color-bg-tertiary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 14px;
	}

	.prose :global(pre) {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		margin-bottom: 16px;
	}

	.prose :global(pre code) {
		background: none;
		padding: 0;
		font-size: 14px;
		line-height: 1.5;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin-bottom: 16px;
		padding-left: 24px;
	}

	.prose :global(li) {
		margin-bottom: 8px;
	}

	.prose :global(blockquote) {
		border-left: 4px solid #a855f7;
		padding-left: 16px;
		margin: 16px 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.prose :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border-primary);
		margin: 32px 0;
	}

	.prose :global(img) {
		max-width: 100%;
		border-radius: 8px;
		margin: 24px 0;
		border: 1px solid var(--color-border-primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.prose :global(video) {
		max-width: 100%;
		margin: 24px 0;
		border: 1px solid var(--color-border-primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		clip-path: inset(0 round 8px);
	}

	/* Screenshot with caption - use ![alt](src "caption") syntax */
	.prose :global(img[title]) {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	/* Figure-like presentation for images with titles */
	.prose :global(p:has(img[title])) {
		text-align: center;
	}

	.prose :global(p > img[title] + br + em),
	.prose :global(p > img + br + em) {
		display: block;
		font-size: 14px;
		color: var(--color-text-secondary);
		margin-top: 8px;
	}

	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 16px;
	}

	.prose :global(th),
	.prose :global(td) {
		border: 1px solid var(--color-border-primary);
		padding: 12px;
		text-align: left;
	}

	.prose :global(th) {
		background: var(--color-bg-secondary);
		font-weight: 600;
	}

	/* TOC Sidebar */
	.toc-sidebar {
		width: 220px;
		flex-shrink: 0;
		padding: 48px 24px 24px 0;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.toc {
		position: sticky;
		top: 48px;
	}

	.toc-title {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-secondary);
		margin: 0 0 12px 0;
	}

	.toc-item {
		display: block;
		font-size: 13px;
		color: var(--color-text-secondary);
		text-decoration: none;
		padding: 4px 0;
		border-left: 2px solid transparent;
		padding-left: 12px;
		margin-left: -12px;
		transition: all 0.15s ease;
	}

	.toc-item:hover {
		color: var(--color-text-primary);
	}

	.toc-item.active {
		color: #a855f7;
		border-left-color: #a855f7;
	}

	.toc-item.level-3 {
		padding-left: 24px;
	}

	.toc-item.level-4 {
		padding-left: 36px;
		font-size: 12px;
	}

	@media (max-width: 768px) {
		.docs-page {
			flex-direction: column;
		}

		.docs-sidebar {
			width: 100%;
			height: auto;
			position: relative;
			border-right: none;
			border-bottom: 1px solid var(--color-border-primary);
			order: 1;
		}

		.toc-sidebar {
			width: 100%;
			height: auto;
			position: relative;
			padding: 16px 24px;
			border-bottom: 1px solid var(--color-border-primary);
			background: var(--color-bg-secondary);
			order: 2;
		}

		.toc-sidebar .toc {
			position: static;
		}

		.toc-sidebar .toc-item {
			display: inline-block;
			margin-right: 16px;
			padding-left: 0;
			margin-left: 0;
			border-left: none;
		}

		.toc-sidebar .toc-item.level-3,
		.toc-sidebar .toc-item.level-4 {
			padding-left: 0;
		}

		.docs-content {
			padding: 24px;
			order: 3;
		}
	}

	@keyframes gradient-flow {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
