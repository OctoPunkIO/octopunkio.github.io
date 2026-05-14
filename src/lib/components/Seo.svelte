<script>
  import { page } from '$app/stores';
  import {
    SITE_URL,
    SITE_NAME,
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
    canonicalFor,
    absoluteImage
  } from '$lib/seo.js';

  /**
   * Per-route SEO metadata. Used by every page; emits <title>, description,
   * canonical, OG, and Twitter card tags into the prerendered HTML so crawlers
   * and link unfurlers see them without running JS.
   */
  export let title = '';
  export let description = DEFAULT_DESCRIPTION;
  /** Page type for Open Graph (e.g. 'website', 'article'). */
  export let type = 'website';
  export let image = '';
  /** Override the auto-derived canonical (rarely needed). */
  export let canonical = '';
  /** ISO date for article-type pages. */
  export let publishedTime = '';
  /** Author name for article-type pages. */
  export let author = '';
  /** Set true on routes that should not appear in search results. */
  export let noindex = false;

  $: pathname = $page?.url?.pathname || '/';
  $: resolvedCanonical = canonical || canonicalFor(pathname);
  // Skip the " — Octopunk" suffix when the page's own title already
  // contains the brand name, to avoid "Introducing Octopunk … — Octopunk".
  $: fullTitle = !title
    ? DEFAULT_TITLE
    : title.toLowerCase().includes(SITE_NAME.toLowerCase())
      ? title
      : `${title} — ${SITE_NAME}`;
  $: ogImage = absoluteImage(image);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={resolvedCanonical} />
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={resolvedCanonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  {#if publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if author}
    <meta property="article:author" content={author} />
  {/if}

</svelte:head>
