<script>
  import { platformArchLabel } from '$lib/downloads.js';

  /** Display label, e.g. "macOS", "Linux", "Windows". */
  export let label = '';
  /** Artifacts belonging to this OS family (each has platform + download_url). */
  export let artifacts = [];
  /** Primary (bigger, accented) vs secondary styling. */
  export let primary = false;
  /** Optional: platform string to sort first in the dropdown (e.g. detected arch). */
  export let preferredPlatform = '';

  let open = false;
  let el;

  $: sortedArtifacts = [...artifacts].sort((a, b) => {
    if (a.platform === preferredPlatform) return -1;
    if (b.platform === preferredPlatform) return 1;
    return 0;
  });

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function handleOutside(e) {
    if (open && el && !el.contains(e.target)) close();
  }
</script>

<svelte:window on:click={handleOutside} />

<div class="download-button" bind:this={el}>
  <button
    class="btn btn-large download-btn"
    class:btn-primary={primary}
    class:btn-secondary={!primary}
    on:click|stopPropagation={toggle}
    disabled={artifacts.length === 0}
  >
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/>
      <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
    </svg>
    {#if artifacts.length === 0}
      No {label} build
    {:else}
      Download for {label}
    {/if}
    {#if artifacts.length > 0}
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="chevron" class:open aria-hidden="true">
        <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"/>
      </svg>
    {/if}
  </button>

  {#if open}
    <div class="dropdown-menu">
      {#each sortedArtifacts as artifact (artifact.platform)}
        <a
          href={artifact.download_url}
          class="dropdown-item"
          on:click={close}
        >
          <span>{platformArchLabel(artifact.platform)}</span>
          {#if artifact.platform === preferredPlatform}
            <span class="dropdown-item-hint">detected</span>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .download-button {
    position: relative;
    display: inline-block;
  }

  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 280px;
    justify-content: center;
  }

  .chevron {
    margin-left: 4px;
    transition: transform 0.2s ease;
  }

  .chevron.open {
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
    min-width: 220px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: var(--color-text-primary);
    text-decoration: none;
    border-left: 2px solid transparent;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .dropdown-item:hover,
  .dropdown-item:focus-visible {
    background: var(--color-bg-elevated);
    border-left-color: var(--color-btn-primary-bg);
    outline: none;
  }

  .dropdown-item-hint {
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  .dropdown-item:hover .dropdown-item-hint {
    color: var(--color-text-primary);
  }
</style>
