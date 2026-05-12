<script>
  import { marked } from 'marked';
  import Header from '$lib/components/Header.svelte';
  import Seo from '$lib/components/Seo.svelte';

  export let data;

  let toc = [];
  let activeId = '';

  function createRenderer() {
    const tocEntries = [];
    const renderer = {
      heading({ tokens, depth, text }) {
        const content = this.parser.parseInline(tokens);
        const slug = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
        if (depth >= 2 && depth <= 4) {
          tocEntries.push({ level: depth, text, id: slug });
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

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

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
      update(newTocItems) { setup(newTocItems); },
      destroy() { if (observer) observer.disconnect(); }
    };
  }
</script>

<Seo
  title={data.meta.title}
  description={data.meta.excerpt || `Read "${data.meta.title}" on the Octopunk blog.`}
  type="article"
  publishedTime={data.meta.date || ''}
  author={data.meta.author || ''}
/>

<div class="post-page">
  <Header />

  <main class="post-layout">
    <article class="post-content">
      <a href="/blog" class="back-to-blog">← Back to blog</a>

      <header class="post-header">
        <h1 class="post-title">{data.meta.title}</h1>
        <div class="post-meta">
          {#if data.meta.date}
            <time datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
          {/if}
          {#if data.meta.author}
            <span class="post-meta-dot" aria-hidden="true">·</span>
            <span>{data.meta.author}</span>
          {/if}
        </div>
      </header>

      <div class="prose" use:observeHeadings={toc}>
        {@html contentHtml}
      </div>
    </article>

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
  </main>
</div>

<style>
  .post-page {
    min-height: 100vh;
    background: var(--color-bg-primary);
  }

  .post-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 64px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 48px 32px 96px;
  }

  .post-content {
    min-width: 0;
    max-width: 760px;
  }

  .back-to-blog {
    display: inline-block;
    margin-bottom: 24px;
    color: var(--color-text-tertiary);
    text-decoration: none;
    font-size: 14px;
  }

  .back-to-blog:hover {
    color: var(--color-text-primary);
  }

  .post-header {
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border-primary);
  }

  .post-title {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text-primary);
  }

  .post-meta {
    margin-top: 12px;
    font-size: 14px;
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Prose styles mirror src/routes/docs/[...slug]/+page.svelte. Kept inline so
     posts render identically to docs without us having to refactor that page. */
  .prose {
    color: var(--color-text-primary);
    line-height: 1.7;
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
    margin-bottom: 10px;
  }

  .prose :global(p) {
    margin-bottom: 18px;
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin: 0 0 18px 24px;
  }

  .prose :global(li) {
    margin-bottom: 6px;
  }

  .prose :global(a) {
    color: var(--color-text-link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .prose :global(a:hover) {
    color: var(--color-text-link-hover);
  }

  .prose :global(code) {
    background: var(--color-bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .prose :global(pre) {
    background: var(--color-bg-inset);
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 0 0 18px;
  }

  .prose :global(pre code) {
    background: transparent;
    padding: 0;
  }

  .prose :global(blockquote) {
    border-left: 3px solid var(--color-border-primary);
    margin: 0 0 18px;
    padding: 4px 0 4px 16px;
    color: var(--color-text-secondary);
  }

  .prose :global(img) {
    max-width: 100%;
    border-radius: 6px;
    margin: 12px 0;
  }

  .prose :global(hr) {
    border: 0;
    border-top: 1px solid var(--color-border-primary);
    margin: 32px 0;
  }

  .toc-sidebar {
    position: sticky;
    top: 32px;
    align-self: start;
    height: max-content;
  }

  .toc {
    border-left: 1px solid var(--color-border-primary);
    padding-left: 16px;
  }

  .toc-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-tertiary);
    margin-bottom: 12px;
  }

  .toc-item {
    display: block;
    padding: 4px 0;
    font-size: 13px;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .toc-item.level-3 { padding-left: 12px; }
  .toc-item.level-4 { padding-left: 24px; }

  .toc-item:hover { color: var(--color-text-primary); }
  .toc-item.active { color: #a855f7; }

  .post-meta-dot { color: var(--color-text-tertiary); }

  @media (max-width: 900px) {
    .post-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 32px;
    }
    .toc-sidebar { display: none; }
  }

  @media (max-width: 600px) {
    .post-layout { padding: 32px 20px 64px; }
    .post-title { font-size: 32px; }
  }
</style>
