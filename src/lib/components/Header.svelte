<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { isAuthenticated, getGitHubAuthURL } from '$lib/api.js';

  let isLoggedIn = false;
  let menuOpen = false;

  onMount(async () => {
    isLoggedIn = await isAuthenticated();
  });

  function handleSignIn() {
    window.location.href = getGitHubAuthURL();
  }

  function toggleMenu() { menuOpen = !menuOpen; }
  function closeMenu() { menuOpen = false; }
  function onKey(e) { if (e.key === 'Escape') closeMenu(); }

  // Nav items in left-to-right order. Each `match` is an array of pathname
  // prefixes; if any of them is a prefix of the current pathname, the link
  // shows the active style.
  const navItems = [
    { href: '/about',   label: 'About',             match: ['/about'] },
    { href: '/blog',    label: 'Blog',              match: ['/blog'] },
    { href: '/docs',    label: 'Docs and features', match: ['/docs'] },
    { href: '/pricing', label: 'Pricing',           match: ['/pricing'] }
  ];

  $: pathname = $page.url.pathname;
  $: isActive = (item) => item.match.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
  // Close the mobile menu whenever the route changes (covers in-app navigation
  // where Svelte doesn't unmount the header between pages).
  $: if (pathname) menuOpen = false;
</script>

<svelte:window on:keydown={onKey} />

<header class="page-header">
  <div class="container header-row">
    <a href="/" class="logo" aria-label="Octopunk home">
      <img src="/octopunk-icon.png" alt="" class="logo-icon" />
      <h1>Octopunk</h1>
    </a>

    <!-- Desktop nav: shown ≥720px -->
    <nav class="header-nav desktop-only" aria-label="Primary">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-link"
          class:active={isActive(item)}
          aria-current={isActive(item) ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
      {#if isLoggedIn}
        <a href="/dashboard" class="btn btn-primary">Dashboard</a>
      {:else}
        <button class="btn btn-primary" on:click={handleSignIn}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm6.56 4.5h5.69a.75.75 0 0 1 0 1.5H8.56l1.97 1.97a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L6.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734Z"/>
          </svg>
          Login with GitHub
        </button>
      {/if}
    </nav>

    <!-- Mobile hamburger: shown <720px -->
    <button
      class="hamburger mobile-only"
      type="button"
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      aria-controls="mobile-nav"
      on:click={toggleMenu}
    >
      {#if menuOpen}
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
        </svg>
      {:else}
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"/>
        </svg>
      {/if}
    </button>
  </div>

  {#if menuOpen}
    <nav id="mobile-nav" class="mobile-nav mobile-only" aria-label="Primary">
      {#each navItems as item}
        <a
          href={item.href}
          class="mobile-nav-link"
          class:active={isActive(item)}
          aria-current={isActive(item) ? 'page' : undefined}
          on:click={closeMenu}
        >
          {item.label}
        </a>
      {/each}
      {#if isLoggedIn}
        <a href="/dashboard" class="btn btn-primary mobile-cta" on:click={closeMenu}>Dashboard</a>
      {:else}
        <button
          class="btn btn-primary mobile-cta"
          on:click={() => { closeMenu(); handleSignIn(); }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm6.56 4.5h5.69a.75.75 0 0 1 0 1.5H8.56l1.97 1.97a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L6.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734Z"/>
          </svg>
          Login with GitHub
        </button>
      {/if}
    </nav>
  {/if}
</header>

<style>
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(90deg, #a855f7, #ec4899, #f97316, #eab308, #a855f7);
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
    background: linear-gradient(90deg, #a855f7, #ec4899, #f97316, #eab308, #a855f7);
    background-size: 300% 100%;
    animation: gradient-flow 8s ease infinite;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Desktop nav */
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
    padding: 6px 0;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--color-text-primary);
  }

  .nav-link.active {
    color: var(--color-text-primary);
    border-bottom-color: #a855f7;
  }

  /* Visibility toggles */
  .desktop-only { display: flex; }
  .mobile-only  { display: none; }

  /* Hamburger button */
  .hamburger {
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .hamburger:hover {
    background: var(--color-component-bg);
    border-color: var(--color-border-secondary);
  }

  /* Mobile drawer */
  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 16px 16px;
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-primary);
  }

  .mobile-nav-link {
    display: block;
    padding: 12px 14px;
    border-radius: 8px;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
  }

  .mobile-nav-link:hover {
    background: var(--color-component-bg);
    color: var(--color-text-primary);
  }

  .mobile-nav-link.active {
    background: rgba(168, 85, 247, 0.12);
    color: #a855f7;
  }

  .mobile-cta {
    margin-top: 8px;
    justify-content: center;
  }

  @media (max-width: 720px) {
    .desktop-only { display: none; }
    .mobile-only  { display: flex; }
  }
</style>
