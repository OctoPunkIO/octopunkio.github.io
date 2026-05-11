<script>
  import Header from '$lib/components/Header.svelte';

  export let data;

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
</script>

<svelte:head>
  <title>Blog - Octopunk</title>
  <meta name="description" content="Notes, releases, and assorted thoughts from the Octopunk team." />
</svelte:head>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container blog-container">
      <section class="blog-hero">
        <h2>Blog</h2>
        <p class="lede">Notes, releases, and assorted thoughts.</p>
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

  .blog-hero h2 {
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
    .blog-hero h2 {
      font-size: 32px;
    }
  }
</style>
