<script>
  import { onMount } from 'svelte';
  import { listReleases, updateRelease, logout } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let releases = [];
  let pagination = { page: 1, per_page: 20, total: 0 };
  let loading = true;
  let error = null;
  let streamFilter = '';

  onMount(() => {
    loadReleases();
  });

  async function loadReleases(page = 1) {
    loading = true;
    error = null;

    try {
      const params = { page, per_page: 20 };
      if (streamFilter) {
        params.stream = streamFilter;
      }
      const data = await listReleases(params);
      releases = data.releases || [];
      pagination = data.pagination;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleToggleYank(release) {
    try {
      await updateRelease(release.id, { yanked: !release.yanked });
      release.yanked = !release.yanked;
      releases = releases;
    } catch (e) {
      alert('Failed to update release: ' + e.message);
    }
  }

  async function handleLogout() {
    await logout();
    goto('/');
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function formatSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getPlatforms(release) {
    if (!release.artifacts || release.artifacts.length === 0) return [];
    return release.artifacts.map(a => a.platform);
  }

  function platformLabel(platform) {
    const labels = {
      'darwin-arm64': 'macOS (ARM)',
      'darwin-x64': 'macOS (Intel)',
      'linux-x64': 'Linux (x64)',
      'linux-arm64': 'Linux (ARM)',
      'windows-x64': 'Windows',
    };
    return labels[platform] || platform;
  }

  // Detail drawer
  let selectedRelease = null;

  function showDetail(release) {
    selectedRelease = selectedRelease?.id === release.id ? null : release;
  }
</script>

<div class="page">
  <header class="page-header">
    <div class="container flex justify-between items-center">
      <div class="logo">
        <a href="/"><h1>Octopunk</h1></a>
        <span class="admin-badge">Admin</span>
      </div>
      <nav class="flex items-center gap-4">
        <a href="/admin" class="nav-link">Dashboard</a>
        <a href="/admin/users" class="nav-link">Users</a>
        <a href="/admin/releases" class="nav-link active">Releases</a>
        <a href="/dashboard" class="btn btn-secondary">Back to App</a>
        <button class="btn btn-secondary" on:click={handleLogout}>Sign Out</button>
      </nav>
    </div>
  </header>

  <main class="page-content">
    <div class="container">
      <div class="flex justify-between items-center mb-4">
        <h2>Releases</h2>
        <div class="filter-box">
          <select bind:value={streamFilter} on:change={() => loadReleases(1)}>
            <option value="">All streams</option>
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="nightly">Nightly</option>
          </select>
        </div>
      </div>

      {#if error}
        <div class="card">
          <p class="text-danger">{error}</p>
        </div>
      {:else}
        <div class="table-container card">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Stream</th>
                <th>Platforms</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if loading}
                <tr>
                  <td colspan="6" class="text-center text-secondary">Loading...</td>
                </tr>
              {:else if releases.length === 0}
                <tr>
                  <td colspan="6" class="text-center text-secondary">No releases found</td>
                </tr>
              {:else}
                {#each releases as release}
                  <tr class:yanked={release.yanked}>
                    <td>
                      <button class="version-link" on:click={() => showDetail(release)}>
                        {release.version}
                      </button>
                    </td>
                    <td>
                      <span class="badge badge-stream badge-{release.stream}">{release.stream}</span>
                    </td>
                    <td>
                      <div class="platform-badges">
                        {#each getPlatforms(release) as platform}
                          <span class="badge badge-platform">{platformLabel(platform)}</span>
                        {/each}
                        {#if getPlatforms(release).length === 0}
                          <span class="text-secondary">-</span>
                        {/if}
                      </div>
                    </td>
                    <td>{formatDate(release.created_at)}</td>
                    <td>
                      {#if release.yanked}
                        <span class="badge badge-yanked">Yanked</span>
                      {:else}
                        <span class="badge badge-active">Active</span>
                      {/if}
                    </td>
                    <td>
                      <button
                        class="toggle-btn"
                        class:active={release.yanked}
                        on:click={() => handleToggleYank(release)}
                      >
                        {release.yanked ? 'Unyank' : 'Yank'}
                      </button>
                    </td>
                  </tr>

                  {#if selectedRelease?.id === release.id}
                    <tr class="detail-row">
                      <td colspan="6">
                        <div class="release-detail">
                          {#if release.release_notes}
                            <div class="detail-section">
                              <h4>Release Notes</h4>
                              <p>{release.release_notes}</p>
                            </div>
                          {/if}

                          {#if release.github_release_url}
                            <div class="detail-section">
                              <h4>GitHub Release</h4>
                              <a href={release.github_release_url} target="_blank" rel="noopener">{release.github_release_url}</a>
                            </div>
                          {/if}

                          {#if release.artifacts && release.artifacts.length > 0}
                            <div class="detail-section">
                              <h4>Artifacts</h4>
                              <div class="artifacts-table">
                                <table class="inner-table">
                                  <thead>
                                    <tr>
                                      <th>Platform</th>
                                      <th>Filename</th>
                                      <th>Size</th>
                                      <th>SHA256</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {#each release.artifacts as artifact}
                                      <tr>
                                        <td>{platformLabel(artifact.platform)}</td>
                                        <td>
                                          <a href={artifact.download_url} target="_blank" rel="noopener">{artifact.filename}</a>
                                        </td>
                                        <td>{formatSize(artifact.size_bytes)}</td>
                                        <td>
                                          <code class="sha256">{artifact.sha256 || '-'}</code>
                                        </td>
                                      </tr>
                                    {/each}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </td>
                    </tr>
                  {/if}
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        {#if pagination.total > pagination.per_page}
          <div class="pagination mt-4">
            <button
              class="btn btn-secondary"
              disabled={pagination.page <= 1}
              on:click={() => loadReleases(pagination.page - 1)}
            >
              Previous
            </button>
            <span class="text-secondary">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.per_page)}
            </span>
            <button
              class="btn btn-secondary"
              disabled={pagination.page * pagination.per_page >= pagination.total}
              on:click={() => loadReleases(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>

<style>
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo a {
    text-decoration: none;
    color: inherit;
  }

  .logo h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .admin-badge {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .nav-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .nav-link:hover {
    color: var(--color-text-primary);
    background-color: var(--color-component-bg-hover);
    text-decoration: none;
  }

  .nav-link.active {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
  }

  .filter-box select {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-component-bg);
    color: var(--color-text-primary);
    font-size: 14px;
  }

  .table-container {
    overflow-x: auto;
    padding: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--color-border-primary);
  }

  th {
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
  }

  tbody tr:hover {
    background-color: var(--color-component-bg-hover);
  }

  tr.yanked {
    opacity: 0.5;
  }

  .version-link {
    background: none;
    border: none;
    color: var(--color-accent-primary);
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    padding: 0;
  }

  .version-link:hover {
    text-decoration: underline;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .badge-stream {
    letter-spacing: 0.5px;
  }

  .badge-stable {
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
  }

  .badge-beta {
    background-color: var(--color-warning-subtle);
    color: var(--color-warning-text);
  }

  .badge-nightly {
    background-color: var(--color-info-subtle);
    color: var(--color-info-text);
  }

  .badge-active {
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
  }

  .badge-yanked {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
  }

  .badge-platform {
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
    font-size: 10px;
    padding: 1px 6px;
  }

  .platform-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .toggle-btn {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 12px;
  }

  .toggle-btn.active {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
    border-color: var(--color-danger-border);
  }

  .detail-row {
    background-color: var(--color-component-bg);
  }

  .detail-row:hover {
    background-color: var(--color-component-bg);
  }

  .release-detail {
    padding: 8px 0;
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .detail-section h4 {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .detail-section a {
    color: var(--color-accent-primary);
    word-break: break-all;
  }

  .inner-table {
    font-size: 13px;
  }

  .inner-table th {
    font-size: 11px;
  }

  .sha256 {
    font-size: 11px;
    color: var(--color-text-secondary);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
</style>
