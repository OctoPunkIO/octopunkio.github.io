<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getMe, clearAuthCache } from '$lib/api.js';

  let error = null;

  onMount(async () => {
    const errorParam = $page.url.searchParams.get('error');

    if (errorParam) {
      error = errorParam;
      return;
    }

    // The auth cookie was set by the API during the OAuth callback redirect
    // Verify we're authenticated by calling /auth/me
    try {
      clearAuthCache(); // Clear any stale cache
      await getMe();
      goto('/dashboard');
    } catch (e) {
      error = 'Authentication failed. Please try again.';
    }
  });
</script>

<div class="page">
  <main class="page-content">
    <div class="container text-center">
      {#if error}
        <div class="card">
          <h2 class="text-danger">Authentication Failed</h2>
          <p class="text-secondary mt-4">{error}</p>
          <a href="/" class="btn btn-primary mt-4">Go Home</a>
        </div>
      {:else}
        <div class="loading">
          <p>Signing you in...</p>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  .page-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .card {
    max-width: 400px;
    padding: 32px;
  }

  .loading {
    font-size: 18px;
    color: var(--color-text-secondary);
  }
</style>
