<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMe, adminLogin, getGitHubAuthURL } from '$lib/api.js';

  let loading = true;
  let authorized = false;
  let showLoginForm = false;

  // Login form state
  let username = '';
  let password = '';
  let loginError = null;
  let loginLoading = false;

  onMount(async () => {
    await checkAuth();
  });

  async function checkAuth() {
    loading = true;
    try {
      const data = await getMe();
      if (!data.user?.is_admin) {
        goto('/dashboard');
        return;
      }
      authorized = true;
      showLoginForm = false;
    } catch (e) {
      // Not authenticated - show login form
      showLoginForm = true;
      authorized = false;
    } finally {
      loading = false;
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    loginError = null;
    loginLoading = true;

    try {
      await adminLogin(username, password);
      // Re-check auth after successful login
      await checkAuth();
    } catch (e) {
      loginError = e.message === 'invalid credentials'
        ? 'Invalid username or password'
        : e.message;
    } finally {
      loginLoading = false;
    }
  }
</script>

{#if loading}
  <div class="page">
    <main class="page-content">
      <div class="container text-center">
        <p class="text-secondary">Loading...</p>
      </div>
    </main>
  </div>
{:else if showLoginForm}
  <div class="page">
    <main class="page-content">
      <div class="container">
        <div class="login-card">
          <h1>Admin Login</h1>
          <p class="text-secondary mb-4">Sign in to access the admin panel</p>

          <form on:submit={handleAdminLogin} class="login-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                bind:value={username}
                placeholder="admin"
                required
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                bind:value={password}
                placeholder="Enter password"
                required
                autocomplete="current-password"
              />
            </div>

            {#if loginError}
              <div class="error-message">{loginError}</div>
            {/if}

            <button type="submit" class="btn btn-primary btn-full" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <a href={getGitHubAuthURL()} class="btn btn-secondary btn-full github-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </a>
        </div>
      </div>
    </main>
  </div>
{:else if authorized}
  <slot />
{/if}

<style>
  .login-card {
    max-width: 400px;
    margin: 80px auto;
    padding: 32px;
    background-color: var(--color-component-bg);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
  }

  .login-card h1 {
    font-size: var(--font-size-headline);
    font-weight: 600;
    margin-bottom: 8px;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: var(--font-size-body);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .form-group input {
    padding: 10px 12px;
    font-size: var(--font-size-body);
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
  }

  .form-group input::placeholder {
    color: var(--color-text-tertiary);
  }

  .error-message {
    padding: 10px 12px;
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-body);
  }

  .btn-full {
    width: 100%;
    justify-content: center;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: var(--color-text-tertiary);
    font-size: var(--font-size-label);
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-border-primary);
  }

  .github-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
