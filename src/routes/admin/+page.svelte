<script>
  import { onMount } from 'svelte';
  import { getAdminStats, logout } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let stats = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      stats = await getAdminStats();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  async function handleLogout() {
    await logout();
    goto('/');
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
        <a href="/admin" class="nav-link active">Dashboard</a>
        <a href="/admin/users" class="nav-link">Users</a>
        <a href="/dashboard" class="btn btn-secondary">Back to App</a>
        <button class="btn btn-secondary" on:click={handleLogout}>Sign Out</button>
      </nav>
    </div>
  </header>

  <main class="page-content">
    <div class="container">
      <h2 class="mb-4">Admin Dashboard</h2>

      {#if loading}
        <p class="text-secondary">Loading stats...</p>
      {:else if error}
        <div class="card">
          <p class="text-danger">{error}</p>
        </div>
      {:else if stats}
        <div class="stats-grid">
          <div class="card stat-card">
            <h3>Total Users</h3>
            <div class="stat-value">{stats.users.total}</div>
            <p class="text-secondary">+{stats.users.this_month} this month</p>
          </div>

          <div class="card stat-card">
            <h3>Active Subscriptions</h3>
            <div class="stat-value text-success">{stats.subscriptions.active}</div>
          </div>

          <div class="card stat-card">
            <h3>Canceled</h3>
            <div class="stat-value">{stats.subscriptions.canceled}</div>
          </div>

          <div class="card stat-card">
            <h3>Past Due</h3>
            <div class="stat-value text-danger">{stats.subscriptions.past_due}</div>
          </div>
        </div>

        <div class="card mt-8">
          <h3>Quick Actions</h3>
          <div class="actions mt-4">
            <a href="/admin/users" class="btn btn-primary">Manage Users</a>
          </div>
        </div>
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-card h3 {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .stat-value {
    font-size: 36px;
    font-weight: 700;
    margin-top: 8px;
  }
</style>
