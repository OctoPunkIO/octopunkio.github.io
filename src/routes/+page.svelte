<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, getGitHubAuthURL } from '$lib/api.js';
  import { detectOS, ALL_PLATFORMS, fetchLatestDownloads, getDownloadForPlatform } from '$lib/downloads.js';

  let isLoggedIn = false;
  let loading = true;
  let detected = null;
  let release = null;
  let dropdownOpen = false;
  let dropdownButton;

  $: primaryDownload = detected && release ? getDownloadForPlatform(release, detected.platform) : null;
  // When we couldn't determine Mac architecture, surface both Mac builds as peers.
  $: macPeer = detected?.family === 'mac' && release
    ? getDownloadForPlatform(release, detected.platform === 'darwin-arm64' ? 'darwin-x64' : 'darwin-arm64')
    : null;
  $: macPeerLabel = detected?.family === 'mac'
    ? (detected.platform === 'darwin-arm64' ? 'macOS (Intel)' : 'macOS (Apple Silicon)')
    : '';
  $: altPlatforms = ALL_PLATFORMS.filter(p =>
    p.platform !== detected?.platform &&
    !(detected?.family === 'mac' && (p.platform === 'darwin-arm64' || p.platform === 'darwin-x64'))
  );

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  function handleClickOutside(event) {
    if (dropdownOpen && dropdownButton && !dropdownButton.contains(event.target)) {
      closeDropdown();
    }
  }

  onMount(async () => {
    isLoggedIn = await isAuthenticated();
    loading = false;
    detected = await detectOS();
    release = await fetchLatestDownloads('stable');

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function handleSignIn() {
    window.location.href = getGitHubAuthURL();
  }

  function getArtifactUrl(platform) {
    const artifact = getDownloadForPlatform(release, platform);
    return artifact?.download_url || null;
  }
</script>

<div class="page">
  <header class="page-header">
    <div class="container flex justify-between items-center">
      <div class="logo">
        <img src="/octopunk-icon.png" alt="Octopunk" class="logo-icon" />
        <h1>Octopunk</h1>
      </div>
      <nav class="header-nav">
        <a href="/docs" class="nav-link">Docs and features</a>
        <a href="/pricing" class="nav-link">Pricing</a>
        {#if isLoggedIn}
          <a href="/dashboard" class="btn btn-primary">Dashboard</a>
        {:else}
          <button class="btn btn-primary" on:click={handleSignIn}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm6.56 4.5h5.69a.75.75 0 0 1 0 1.5H8.56l1.97 1.97a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L6.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734Z"/>
            </svg>
            Login with GitHub
          </button>
        {/if}
      </nav>
    </div>
  </header>

  <main class="page-content">
    <div class="container">
      <section class="hero text-center">
        <h2>Navigate GitHub Like You Navigate Code</h2>
        <p class="text-secondary mt-4">
          Octopunk is a GitHub client built for the modern hacker. Fuzzy search across repos,
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
          {:else if detected && primaryDownload}
            <!-- OS detected and artifact available -->
            <div class="flex gap-2 items-center" style="flex-wrap: wrap;">
              <a href={primaryDownload.download_url} class="btn btn-primary btn-large download-btn">
                <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                  <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                </svg>
                Download for {detected.label || detected.os}
              </a>
              {#if detected.family === 'mac' && macPeer}
                <a href={macPeer.download_url} class="btn btn-large download-btn">
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                    <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                  </svg>
                  {macPeerLabel}
                </a>
              {/if}
            </div>
            <p class="download-alt text-secondary mt-4">
              {release.version}{#if altPlatforms.length > 0} · or download for
                {#each altPlatforms as alt}
                  {@const url = getArtifactUrl(alt.platform)}
                  {#if url}
                    <a href={url}>{alt.label}</a>{' '}
                  {/if}
                {/each}
              {/if}
            </p>
          {:else}
            <!-- OS not detected or no artifact for this OS — show dropdown -->
            <div class="download-dropdown" bind:this={dropdownButton}>
              <button class="btn btn-primary btn-large download-btn" on:click={toggleDropdown}>
                <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
                  <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
                </svg>
                Download Octopunk
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="chevron" class:open={dropdownOpen}>
                  <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"/>
                </svg>
              </button>
              {#if dropdownOpen}
                <div class="dropdown-menu">
                  {#each ALL_PLATFORMS as plat}
                    {@const url = getArtifactUrl(plat.platform)}
                    {#if url}
                      <a href={url} class="dropdown-item" on:click={closeDropdown}>
                        {plat.label}
                      </a>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
            {#if release}
              <p class="download-alt text-secondary mt-4">{release.version}</p>
            {/if}
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
            autoplay
            muted
            loop
            playsinline
          ></video>
        </div>
      </section>
    </div>
  </main>

  <footer class="page-footer">
    <div class="container text-center text-secondary">
      <p>&copy; 2025 Octopunk. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
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
    filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))
            drop-shadow(0 0 16px rgba(236, 72, 153, 0.4));
  }

  .logo h1 {
    font-family: 'Audiowide', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
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
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero h2 {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1px;
  }

  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
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

  .download-dropdown {
    position: relative;
    display: inline-block;
  }

  .download-btn .chevron {
    margin-left: 4px;
    transition: transform 0.2s ease;
  }

  .download-btn .chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .dropdown-item:hover {
    background: var(--color-bg-tertiary);
  }

  .dropdown-item-ext {
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--color-text-primary);
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

  .page-footer {
    padding: 24px 0;
    border-top: 1px solid var(--color-border-primary);
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
