<script>
  import { onMount } from 'svelte';
  import { listUsers, updateUser, deleteUser, logout } from '$lib/api.js';
  import { goto } from '$app/navigation';

  let users = [];
  let pagination = { page: 1, per_page: 50, total: 0 };
  let loading = true;
  let error = null;
  let searchQuery = '';

  onMount(() => {
    loadUsers();
  });

  async function loadUsers(page = 1) {
    loading = true;
    error = null;

    try {
      const params = { page, per_page: 50 };
      if (searchQuery) {
        params.q = searchQuery;
      }
      const data = await listUsers(params);
      users = data.users;
      pagination = data.pagination;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    loadUsers(1);
  }

  async function handleToggleAdmin(user) {
    try {
      await updateUser(user.id, { is_admin: !user.is_admin });
      user.is_admin = !user.is_admin;
      users = users; // Trigger reactivity
    } catch (e) {
      alert('Failed to update user: ' + e.message);
    }
  }

  async function handleToggleOverride(user) {
    try {
      await updateUser(user.id, { subscription_override: !user.subscription_override });
      user.subscription_override = !user.subscription_override;
      users = users; // Trigger reactivity
    } catch (e) {
      alert('Failed to update user: ' + e.message);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Are you sure you want to delete ${user.github_login}?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      users = users.filter(u => u.id !== user.id);
    } catch (e) {
      alert('Failed to delete user: ' + e.message);
    }
  }

  async function handleLogout() {
    await logout();
    goto('/');
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
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
        <a href="/admin/users" class="nav-link active">Users</a>
        <a href="/admin/releases" class="nav-link">Releases</a>
        <a href="/dashboard" class="btn btn-secondary">Back to App</a>
        <button class="btn btn-secondary" on:click={handleLogout}>Sign Out</button>
      </nav>
    </div>
  </header>

  <main class="page-content">
    <div class="container">
      <div class="flex justify-between items-center mb-4">
        <h2>Users</h2>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search users..."
            bind:value={searchQuery}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="btn btn-secondary" on:click={handleSearch}>Search</button>
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
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Admin</th>
                <th>Override</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if loading}
                <tr>
                  <td colspan="7" class="text-center text-secondary">Loading...</td>
                </tr>
              {:else if users.length === 0}
                <tr>
                  <td colspan="7" class="text-center text-secondary">No users found</td>
                </tr>
              {:else}
                {#each users as user}
                  <tr>
                    <td>
                      <div class="user-cell">
                        <span class="github-login">{user.github_login}</span>
                        <span class="github-id text-secondary">#{user.github_id}</span>
                      </div>
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>
                      {#if user.subscription_override}
                        <span class="badge badge-override">Override</span>
                      {:else if user.subscription_status === 'active'}
                        <span class="badge badge-active">Active</span>
                      {:else if user.subscription_status === 'past_due'}
                        <span class="badge badge-past-due">Past Due</span>
                      {:else if user.subscription_status === 'canceled'}
                        <span class="badge badge-canceled">Canceled</span>
                      {:else}
                        <span class="badge badge-free">Free</span>
                      {/if}
                    </td>
                    <td>
                      <button
                        class="toggle-btn"
                        class:active={user.is_admin}
                        on:click={() => handleToggleAdmin(user)}
                      >
                        {user.is_admin ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>
                      <button
                        class="toggle-btn"
                        class:active={user.subscription_override}
                        on:click={() => handleToggleOverride(user)}
                      >
                        {user.subscription_override ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <button class="btn-icon btn-danger-icon" on:click={() => handleDelete(user)}>
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                          <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
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
              on:click={() => loadUsers(pagination.page - 1)}
            >
              Previous
            </button>
            <span class="text-secondary">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.per_page)}
            </span>
            <button
              class="btn btn-secondary"
              disabled={pagination.page * pagination.per_page >= pagination.total}
              on:click={() => loadUsers(pagination.page + 1)}
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

  .search-box {
    display: flex;
    gap: 8px;
  }

  .search-box input {
    width: 250px;
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

  .user-cell {
    display: flex;
    flex-direction: column;
  }

  .github-login {
    font-weight: 500;
  }

  .github-id {
    font-size: 12px;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .badge-active {
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
  }

  .badge-override {
    background-color: var(--color-info-subtle);
    color: var(--color-info-text);
  }

  .badge-past-due {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
  }

  .badge-canceled {
    background-color: var(--color-warning-subtle);
    color: var(--color-warning-text);
  }

  .badge-free {
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
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
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
    border-color: var(--color-success-border);
  }

  .btn-icon {
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
  }

  .btn-danger-icon {
    color: var(--color-text-secondary);
  }

  .btn-danger-icon:hover {
    color: var(--color-danger-text);
    background-color: var(--color-danger-subtle);
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
</style>
