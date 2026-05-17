<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, getGitHubAuthURL } from '$lib/api.js';
  import { detectOS, fetchLatestDownloads, getStreamFromURL, groupArtifactsByFamily, OS_FAMILIES } from '$lib/downloads.js';
  import DownloadButton from '$lib/components/DownloadButton.svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { SITE_URL, DEFAULT_DESCRIPTION } from '$lib/seo.js';

  let isLoggedIn = false;
  let loading = true;
  let detected = null;
  let release = null;
  let currentStream = 'stable';

  $: grouped = release ? groupArtifactsByFamily(release) : { mac: [], linux: [], windows: [] };
  // Stable ordering: detected family first, others in OS_FAMILIES order.
  $: orderedFamilies = (() => {
    const primaryKey = detected?.family;
    const rest = OS_FAMILIES.filter(f => f.family !== primaryKey);
    const primary = OS_FAMILIES.find(f => f.family === primaryKey);
    return primary ? [primary, ...rest] : OS_FAMILIES;
  })();

  onMount(async () => {
    isLoggedIn = await isAuthenticated();
    loading = false;
    detected = await detectOS();
    currentStream = getStreamFromURL();
    release = await fetchLatestDownloads(currentStream);
  });

  function handleSignIn() {
    window.location.href = getGitHubAuthURL();
  }
</script>

<Seo description={DEFAULT_DESCRIPTION} />

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OctoPunk',
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free for public repositories; subscription unlocks private repositories.'
    },
    author: {
      '@type': 'Organization',
      name: 'OctoPunk',
      url: SITE_URL,
      sameAs: ['https://www.linkedin.com/company/octopunk']
    }
  })}<\/script>`}
</svelte:head>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container">
      {#if currentStream === 'beta'}
        <div class="beta-banner">
          <div class="beta-banner-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
            </svg>
          </div>
          <div class="beta-banner-body">
            <strong>You're on the beta channel.</strong>
            Beta builds can be unstable, and we may reset the app data directory
            between releases (clears your settings and sign-in). Use
            <a href="?stream=stable" data-sveltekit-reload>the stable channel</a>
            if you'd rather avoid that.
          </div>
        </div>
      {/if}

      <section class="hero text-center">
        <h1>Navigate GitHub Like You Navigate Code</h1>
        <p class="hero-tagline text-secondary mt-4">
          A GitHub Desktop alternative for Mac, Linux, and Windows — built for power users.
        </p>
        <p class="text-secondary mt-4">
          OctoPunk is a GitHub client built for the modern hacker. Fuzzy search across repos,
          create tailored dashboard views, LSP aware, and keyboard shortcuts everywhere — GitHub that finally works like your editor.
        </p>
        <p class="text-secondary mt-4">
		  And yes... it uses 🪄AI🪄.
		</p>

        <div class="cta mt-8">
          {#if !release}
            <!-- No release registered in the API yet. We intentionally do NOT
                 fall back to github.com/.../releases because the source repo
                 is private and that link 404s for anonymous users. -->
            <button class="btn btn-primary btn-large download-btn" disabled>
              <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
              </svg>
              Downloads coming soon
            </button>
            <p class="download-alt text-secondary mt-4">No release is available yet — check back shortly.</p>
            {#if currentStream !== 'beta'}
              <p class="download-alt text-secondary mt-2">
                <a href="?stream=beta" data-sveltekit-reload>Looking for the beta?</a>
              </p>
            {/if}
          {:else}
            <div class="download-triangle">
              <DownloadButton
                label={orderedFamilies[0].label}
                artifacts={grouped[orderedFamilies[0].family]}
                primary={true}
                preferredPlatform={detected?.family === orderedFamilies[0].family ? detected.platform : ''}
              />
              <div class="download-triangle-row">
                {#each orderedFamilies.slice(1) as fam (fam.family)}
                  <DownloadButton
                    label={fam.label}
                    artifacts={grouped[fam.family]}
                    primary={false}
                  />
                {/each}
              </div>
            </div>
            <p class="download-alt text-secondary mt-4">{release.version}</p>
          {/if}
        </div>
      </section>

      <section class="features mt-8">
        <div class="feature-grid">
          <div class="card">
            <h3>Always Free for Open Source</h3>
            <p class="text-secondary">
              Every feature, completely free for public repositories.
            </p>
          </div>
          <div class="card">
            <h3>Subscribe for Private Repos</h3>
            <p class="text-secondary">
              Unlock access to private repositories with a subscription.
            </p>
          </div>
        </div>
      </section>

      <section class="screenshot-section mt-8">
        <div class="screenshot-wrapper">
          <div class="screenshot-glow"></div>
          <video
            src="/screens/octopunk-demo-reel.mp4"
            class="app-video"
            poster="/app-screenshot.png"
            preload="metadata"
            autoplay
            muted
            loop
            playsinline
          ></video>
        </div>
      </section>
    </div>
  </main>

  <Footer />
</div>

<style>
  .hero h1 {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 1.1;
  }

  .hero-tagline {
    font-size: 20px;
    font-weight: 500;
  }

  .beta-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin: 24px 0 0;
    padding: 14px 18px;
    border-radius: 10px;
    border: 1px solid rgba(234, 179, 8, 0.35);
    background: rgba(234, 179, 8, 0.08);
    color: var(--color-text-primary);
    font-size: 14px;
    line-height: 1.55;
    text-align: left;
  }

  .beta-banner-icon {
    flex-shrink: 0;
    color: #eab308;
    margin-top: 2px;
  }

  .beta-banner-body strong {
    margin-right: 6px;
  }

  .beta-banner-body a {
    color: var(--color-text-link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .beta-banner-body a:hover {
    color: var(--color-text-link-hover);
  }

  @media (max-width: 600px) {
    .hero h1 {
      font-size: 32px;
      letter-spacing: -0.5px;
    }
    .hero p {
      font-size: 16px;
    }
    .hero-tagline {
      font-size: 17px;
    }
  }

  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .download-triangle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .download-triangle-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .download-alt {
    font-size: 14px;
  }

  .download-alt a {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .download-alt a:hover {
    color: var(--color-text-primary);
    text-decoration: underline;
  }

  .hero p {
    font-size: 18px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    max-width: 700px;
    margin: 0 auto;
  }

  .feature-grid .card {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(0);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .feature-grid .card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.25),
      0 12px 24px rgba(0, 0, 0, 0.2);
  }

  .feature-grid .card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  /* Screenshot section with cyberpunk glow */
  .screenshot-section {
    padding: 48px 0;
  }

  .screenshot-wrapper {
    position: relative;
    max-width: 95%;
    margin: 0 auto;
    border-radius: 8px;
    padding: 2px;
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
    line-height: 0;
  }

  .screenshot-glow {
    position: absolute;
    inset: -2px;
    border-radius: 10px;
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
    filter: blur(12px);
    opacity: 0.6;
    z-index: -1;
  }

  .app-video {
    display: block;
    width: 100%;
    border-radius: 6px;
    clip-path: inset(0 round 6px);
    vertical-align: top;
  }

</style>
