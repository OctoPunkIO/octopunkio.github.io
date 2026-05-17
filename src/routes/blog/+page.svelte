<script>
  import Header from '$lib/components/Header.svelte';
  import Seo from '$lib/components/Seo.svelte';

  export let data;

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
</script>

<Seo
  title="Blog"
  description="Notes, releases, and assorted thoughts from the OctoPunk team on building a GitHub client for power users."
/>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container blog-container">
      <section class="blog-hero">
        <h1>Blog</h1>
        <p class="lede">Notes, releases, and assorted thoughts.</p>
        <a class="blog-feed-link" href="/atom.xml" aria-label="Atom feed">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M2.002 2.725a.75.75 0 0 1 .797-.7C9.418 2.43 14.57 7.582 14.975 14.201a.75.75 0 1 1-1.497.092 11.252 11.252 0 0 0-10.58-10.58.75.75 0 0 1-.896-.988Zm.046 5.066A.75.75 0 0 1 2.84 7.04a8.252 8.252 0 0 1 8.117 8.117.75.75 0 0 1-1.498.09A6.752 6.752 0 0 0 2.94 8.789a.75.75 0 0 1-.892-.998ZM3.5 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"/>
          </svg>
          Subscribe via Atom
        </a>
      </section>

      {#if data.posts.length === 0}
        <p class="blog-empty">No posts yet. Come back soon.</p>
      {:else}
        <ul class="blog-list">
          {#each data.posts as post}
            <li class="blog-item">
              <a href="/blog/{post.slug}" class="blog-item-link">
                <h3 class="blog-item-title">{post.title}</h3>
                <div class="blog-item-meta">
                  {#if post.date}
                    <time datetime={post.date}>{formatDate(post.date)}</time>
                  {/if}
                  {#if post.author}
                    <span class="blog-item-dot" aria-hidden="true">·</span>
                    <span>{post.author}</span>
                  {/if}
                </div>
                {#if post.excerpt}
                  <p class="blog-item-excerpt">{post.excerpt}</p>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </main>
</div>

<style>
  .blog-container {
    max-width: 760px;
    padding-top: 48px;
    padding-bottom: 64px;
  }

  .blog-hero h1 {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .lede {
    margin-top: 12px;
    font-size: 18px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .blog-feed-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-border-primary);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 13px;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .blog-feed-link:hover {
    color: var(--color-text-primary);
    border-color: var(--color-border-secondary);
  }

  .blog-list {
    list-style: none;
    padding: 0;
    margin: 32px 0 0;
    border-top: 1px solid var(--color-border-primary);
  }

  .blog-item {
    border-bottom: 1px solid var(--color-border-primary);
  }

  .blog-item-link {
    display: block;
    padding: 24px 0;
    text-decoration: none;
    color: inherit;
  }

  .blog-item-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    transition: color 0.15s ease;
  }

  .blog-item-link:hover .blog-item-title {
    color: var(--color-text-link);
  }

  .blog-item-meta {
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .blog-item-dot {
    color: var(--color-text-tertiary);
  }

  .blog-item-excerpt {
    margin-top: 10px;
    color: var(--color-text-secondary);
    line-height: 1.55;
  }

  .blog-empty {
    margin-top: 32px;
    color: var(--color-text-secondary);
  }

  @media (max-width: 600px) {
    .blog-container {
      padding-top: 32px;
    }
    .blog-hero h1 {
      font-size: 32px;
    }
  }
</style>
