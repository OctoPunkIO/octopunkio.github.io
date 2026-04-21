<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    getMe,
    logout,
    createCheckout,
    createPortal,
    verifyCheckout,
    syncSubscription,
    cancelSubscription,
    getSubscriptionState,
    undoCancelSubscription
  } from '$lib/api.js';
  import { detectOS, ALL_PLATFORMS, fetchLatestDownloads, getDownloadForPlatform, getStreamFromURL } from '$lib/downloads.js';
  import { pollingManager } from '$lib/utils/pollingManager.js';

  let user = null;
  let subscription = null;
  let subscriptionState = null; // { state, status, allowed_actions, current_period_end, cancel_at_period_end }
  let loading = true;
  let error = null;
  let checkoutStatus = null;
  let checkoutVerified = false;
  let billingInterval = 'monthly'; // 'monthly' or 'annual' - from URL param or default

  // Action states
  let subscribing = false;
  let startingOver = false;
  let canceling = false;
  let undoingCancel = false;
  let syncing = false;
  let syncResult = null; // { status, changed, message }
  let syncCooldown = 0; // Seconds remaining before sync is allowed
  let cooldownInterval = null;
  let unsubscribePolling = null;

  // Downloads
  let detected = null;
  let release = null;
  let selectedStream = 'stable';

  // Helper to check if an action is allowed
  function canDoAction(action) {
    if (!subscriptionState?.allowed_actions) return false;
    return subscriptionState.allowed_actions.includes(action);
  }

  async function loadRelease(stream) {
    release = null;
    release = await fetchLatestDownloads(stream);
  }

  function onStreamChange() {
    const url = new URL(window.location.href);
    if (selectedStream === 'stable') {
      url.searchParams.delete('stream');
    } else {
      url.searchParams.set('stream', selectedStream);
    }
    window.history.replaceState({}, '', url.pathname + url.search);
    loadRelease(selectedStream);
  }

  onMount(async () => {
    // Load download info (non-blocking)
    selectedStream = getStreamFromURL();
    detectOS().then(d => { detected = d; });
    loadRelease(selectedStream);

    // Reset redirect states (handles browser back button from Stripe checkout)
    subscribing = false;

    // Check for billing interval in URL (from pricing page)
    const intervalParam = $page.url.searchParams.get('interval');
    if (intervalParam === 'monthly' || intervalParam === 'annual') {
      billingInterval = intervalParam;
    }

    // Check for checkout status in URL
    checkoutStatus = $page.url.searchParams.get('checkout');
    const sessionId = $page.url.searchParams.get('session_id');

    // If returning from successful checkout, verify it first (belt-and-suspenders)
    if (checkoutStatus === 'success' && sessionId) {
      try {
        const result = await verifyCheckout(sessionId);
        checkoutVerified = result.verified;
      } catch (e) {
        console.warn('Checkout verification failed:', e.message);
        // Continue anyway - webhook may have already activated it
      }

      // Clear URL params after verification to prevent re-verification on refresh
      // Use replaceState to avoid polluting browser history
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.pathname);
    } else if (checkoutStatus === 'canceled') {
      // Clear canceled param too after displaying
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.pathname);
    }

    try {
      // Fetch user data and subscription state in parallel
      const [userData, stateData] = await Promise.all([
        getMe(),
        getSubscriptionState().catch(() => null) // Don't fail if state endpoint fails
      ]);

      user = userData.user;
      subscription = userData.subscription;
      subscriptionState = stateData;
    } catch (e) {
      error = e.message;
      // Handle both unauthorized and user not found by redirecting to login
      // "user not found" happens when session cookie exists but user was deleted from DB
      if (e.message === 'Unauthorized' || e.message === 'user not found') {
        // Clear stale session and redirect to home
        try {
          await logout();
        } catch {
          // Ignore logout errors - session may already be invalid
        }
        goto('/');
        return;
      }
    } finally {
      loading = false;
    }

    // Start polling for subscription status updates (5 minute interval)
    unsubscribePolling = pollingManager.startPolling(
      'dashboard-subscription-status',
      async () => {
        await refreshState();
      },
      { interval: 5 * 60 * 1000, immediate: false }
    );
  });

  async function refreshState() {
    try {
      const [userData, stateData] = await Promise.all([
        getMe(),
        getSubscriptionState().catch(() => null)
      ]);
      user = userData.user;
      subscription = userData.subscription;
      subscriptionState = stateData;
    } catch (e) {
      console.error('Failed to refresh state:', e);
    }
  }

  async function handleLogout() {
    await logout();
    goto('/');
  }

  // Action: Subscribe (state: none) or Resubscribe (state: canceled)
  async function handleSubscribe() {
    subscribing = true;
    error = null;
    try {
      const data = await createCheckout({ interval: billingInterval });
      if (data.recovered) {
        // Found an existing subscription - refresh to show it
        await refreshState();
        subscribing = false;
        syncResult = { status: 'success', changed: true, message: data.message || 'Found your existing subscription!' };
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      error = e.message;
      subscribing = false;
    }
  }

  // Action: Manage Billing (states: active, canceling, past_due for update_payment)
  async function handleManageBilling() {
    try {
      const data = await createPortal();
      window.location.href = data.portal_url;
    } catch (e) {
      error = e.message;
    }
  }

  // Action: Start Over (state: incomplete)
  async function handleStartOver() {
    startingOver = true;
    error = null;
    try {
      // First cancel the incomplete subscription
      await cancelSubscription();
      // Then start a new checkout
      const data = await createCheckout({ interval: billingInterval });
      window.location.href = data.checkout_url;
    } catch (e) {
      error = e.message;
      startingOver = false;
    }
  }

  // Action: Cancel (states: incomplete, active, past_due)
  async function handleCancel() {
    canceling = true;
    error = null;
    try {
      const result = await cancelSubscription();
      // Refresh state to reflect new status
      await refreshState();

      // Show feedback based on result
      if (result.state === 'canceling') {
        syncResult = { status: 'success', changed: true, message: result.message || 'Subscription scheduled for cancellation' };
      } else {
        syncResult = { status: 'success', changed: true, message: result.message || 'Subscription canceled' };
      }

      // Clear message after delay
      setTimeout(() => { syncResult = null; }, 5000);
    } catch (e) {
      error = e.message;
    } finally {
      canceling = false;
    }
  }

  // Action: Undo Cancel (state: canceling)
  async function handleUndoCancel() {
    undoingCancel = true;
    error = null;
    try {
      const result = await undoCancelSubscription();
      // Refresh state to reflect new status
      await refreshState();
      syncResult = { status: 'success', changed: true, message: result.message || 'Subscription will continue to renew' };

      // Clear message after delay
      setTimeout(() => { syncResult = null; }, 5000);
    } catch (e) {
      error = e.message;
    } finally {
      undoingCancel = false;
    }
  }

  function startCooldownTimer(seconds) {
    syncCooldown = seconds;
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
    }
    cooldownInterval = setInterval(() => {
      syncCooldown--;
      if (syncCooldown <= 0) {
        syncCooldown = 0;
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
    }, 1000);
  }

  async function handleSync() {
    syncing = true;
    error = null;
    syncResult = null;
    try {
      // Get old state for comparison
      const oldState = subscriptionState?.state;

      const result = await syncSubscription();

      // Refresh state
      await refreshState();

      // Determine if anything changed
      const newState = subscriptionState?.state;
      const changed = oldState !== newState || result.recovered;

      let message;
      if (result.recovered) {
        message = result.message || 'Found and recovered your subscription!';
      } else if (changed) {
        message = `Status updated: ${oldState || 'none'} → ${newState}`;
      } else {
        message = `Status confirmed: ${newState}`;
      }

      syncResult = { status: 'success', changed, message };

      // Start 30s cooldown timer (matches API rate limit)
      startCooldownTimer(30);

      // Clear sync result after 5 seconds (longer for recovery)
      setTimeout(() => {
        syncResult = null;
      }, result.recovered ? 8000 : 5000);
    } catch (e) {
      // Check if it's a rate limit error
      if (e.retryAfter) {
        startCooldownTimer(e.retryAfter);
        syncResult = { status: 'rate_limited', changed: false, message: `Please wait ${e.retryAfter}s before syncing again` };
      } else {
        error = e.message;
        syncResult = { status: 'error', changed: false, message: e.message };
      }
    } finally {
      syncing = false;
    }
  }

  onDestroy(() => {
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
    }
    unsubscribePolling?.();
  });

  // Match API's HasActiveSubscription() logic
  // Grace period in milliseconds (60 seconds) - matches backend
  const SUBSCRIPTION_GRACE_PERIOD_MS = 60 * 1000;

  function isLicensed() {
    if (!user) return false;
    // 1. Admin-granted override (bypasses Stripe)
    if (user.subscription_override) return true;
    // 2. Active, canceling, or trialing subscription (has access)
    const state = subscriptionState?.state;
    if (state === 'active' || state === 'canceling' || state === 'trialing') {
      // Safety net: check if period actually expired (handles missed webhooks)
      if (subscriptionState?.current_period_end) {
        const periodEnd = new Date(subscriptionState.current_period_end);
        const expiryWithGrace = new Date(periodEnd.getTime() + SUBSCRIPTION_GRACE_PERIOD_MS);
        if (new Date() > expiryWithGrace) {
          return false;
        }
      }
      return true;
    }
    // 3. No active subscription
    return false;
  }

  // Get display info based on state machine state
  function getStateDisplayInfo() {
    const state = subscriptionState?.state;

    switch (state) {
      case 'active':
        return { badge: 'Active', badgeClass: 'status-active', message: null };
      case 'canceling':
        return { badge: 'Canceling', badgeClass: 'status-canceling', message: null };
      case 'incomplete':
        return {
          badge: 'Incomplete',
          badgeClass: 'status-warning',
          message: 'Your payment is pending. Complete it in the billing portal or cancel to start over.'
        };
      case 'past_due':
        return {
          badge: 'Past Due',
          badgeClass: 'status-warning',
          message: 'Your payment failed. Please update your payment method to restore access.'
        };
      case 'unpaid':
        return {
          badge: 'Suspended',
          badgeClass: 'status-error',
          message: 'Your subscription is suspended due to payment issues. Please update your payment method.'
        };
      case 'trialing':
        return {
          badge: 'Trial',
          badgeClass: 'status-active',
          message: 'You are currently in a trial period.'
        };
      case 'canceled':
        return {
          badge: 'Canceled',
          badgeClass: 'status-inactive',
          message: 'Your subscription has been canceled. Subscribe again to restore access.'
        };
      case 'none':
      default:
        return { badge: 'Free', badgeClass: 'status-inactive', message: null };
    }
  }

  // Reactive: update display info when state changes
  $: stateDisplayInfo = (subscriptionState, getStateDisplayInfo());

  // Reactive: recalculate licensed status when user or subscriptionState changes
  $: licensed = (user, subscriptionState, isLicensed());
</script>

<div class="page">
  <header class="page-header">
    <div class="container flex justify-between items-center">
      <a href="/" class="logo">
        <img src="/octopunk-icon.png" alt="Octopunk" class="logo-icon" />
        <h1>Octopunk</h1>
      </a>
      <nav class="flex items-center gap-4">
        {#if user?.is_admin}
          <a href="/admin" class="btn btn-secondary">Admin</a>
        {/if}
        <button class="btn btn-secondary" on:click={handleLogout}>Sign Out</button>
      </nav>
    </div>
  </header>

  <main class="page-content">
    <div class="container">
      {#if loading}
        <p class="text-center text-secondary">Loading...</p>
      {:else if error}
        <div class="card text-center">
          <p class="text-danger">{error}</p>
        </div>
      {:else if user}
        {#if checkoutStatus === 'success'}
          <div class="alert alert-success mb-4">
            <p>Thanks for subscribing! Your subscription is now active.</p>
          </div>
        {:else if checkoutStatus === 'canceled'}
          <div class="alert alert-warning mb-4">
            <p>Checkout was canceled. You can try again when you're ready.</p>
          </div>
        {/if}

        <div class="dashboard-grid">
          <div class="card user-card">
            <div class="user-header">
              {#if user.auth_type === 'internal'}
                <div class="avatar avatar-placeholder">
                  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor">
                    <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
                  </svg>
                </div>
              {:else if user.avatar_url}
                <img src={user.avatar_url} alt={user.github_login} class="avatar" />
              {:else}
                <div class="avatar avatar-placeholder">
                  <svg viewBox="0 0 16 16" width="32" height="32" fill="currentColor">
                    <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
                  </svg>
                </div>
              {/if}
              <div>
                <div class="user-name-row">
                  <h2>{user.github_login}</h2>
                  {#if user.auth_type === 'internal'}
                    <span class="admin-badge">Admin Account</span>
                  {/if}
                </div>
                {#if user.email}
                  <p class="text-secondary">{user.email}</p>
                {/if}
              </div>
            </div>
          </div>

          <div class="card subscription-card">
            <h3>Subscription Status</h3>

            {#if licensed}
              <!-- User has active access -->
              {#if subscriptionState?.state === 'canceling'}
                <div class="status-badge status-canceling mt-4">
                  <span>Canceling</span>
                </div>
                <p class="text-secondary mt-4">
                  Your subscription is active but will not renew. You have full access until the end of your billing period.
                </p>
                {#if subscriptionState?.current_period_end}
                  <p class="text-warning">
                    Ends: {new Date(subscriptionState.current_period_end).toLocaleDateString()}
                  </p>
                {/if}
                <div class="subscription-actions mt-4">
                  {#if canDoAction('undo_cancel')}
                    <button
                      class="btn btn-primary tooltip-trigger"
                      on:click={handleUndoCancel}
                      disabled={undoingCancel}
                    >
                      {undoingCancel ? 'Processing...' : 'Keep Subscription'}
                      <span class="tooltip">Undo cancellation and continue subscription</span>
                    </button>
                  {/if}
                  {#if canDoAction('manage_billing')}
                    <button class="btn btn-secondary" on:click={handleManageBilling}>
                      Manage Billing
                    </button>
                  {/if}
                  <button class="btn btn-secondary" on:click={handleSync} disabled={syncing || syncCooldown > 0}>
                    {#if syncing}
                      Refreshing...
                    {:else if syncCooldown > 0}
                      Refresh ({syncCooldown}s)
                    {:else}
                      Refresh
                    {/if}
                  </button>
                </div>

                {#if syncResult}
                  <div class="sync-result mt-2 {syncResult.status === 'error' ? 'sync-error' : syncResult.status === 'rate_limited' ? 'sync-rate-limited' : syncResult.changed ? 'sync-changed' : 'sync-confirmed'}">
                    {syncResult.message}
                  </div>
                {/if}
              {:else}
                <div class="status-badge status-active mt-4">
                  <span>Active</span>
                </div>
                <p class="text-secondary mt-4">
                  You have full access to private repositories, issues, pull requests, and more.
                </p>
                {#if subscriptionState?.current_period_end}
                  <p class="text-secondary">
                    Renews: {new Date(subscriptionState.current_period_end).toLocaleDateString()}
                  </p>
                {/if}
                <div class="subscription-actions mt-4">
                  {#if !user.subscription_override}
                    {#if canDoAction('cancel')}
                      <button
                        class="btn btn-danger tooltip-trigger"
                        on:click={handleCancel}
                        disabled={canceling}
                      >
                        {canceling ? 'Canceling...' : 'Cancel Subscription'}
                        <span class="tooltip">Cancel at end of billing period</span>
                      </button>
                    {/if}
                    {#if canDoAction('manage_billing')}
                      <button class="btn btn-secondary" on:click={handleManageBilling}>
                        Manage Billing
                      </button>
                    {/if}
                  {/if}
                  <button class="btn btn-secondary" on:click={handleSync} disabled={syncing || syncCooldown > 0}>
                    {#if syncing}
                      Refreshing...
                    {:else if syncCooldown > 0}
                      Refresh ({syncCooldown}s)
                    {:else}
                      Refresh
                    {/if}
                  </button>
                </div>

                {#if syncResult}
                  <div class="sync-result mt-2 {syncResult.status === 'error' ? 'sync-error' : syncResult.status === 'rate_limited' ? 'sync-rate-limited' : syncResult.changed ? 'sync-changed' : 'sync-confirmed'}">
                    {syncResult.message}
                  </div>
                {/if}
              {/if}
            {:else}
              <!-- User does NOT have active access -->
              <div class="status-badge {stateDisplayInfo.badgeClass} mt-4">
                <span>{stateDisplayInfo.badge}</span>
              </div>

              {#if stateDisplayInfo.message}
                <p class="text-warning mt-4">{stateDisplayInfo.message}</p>
              {:else}
                <p class="text-secondary mt-4">
                  You have access to public repositories only.
                  Subscribe to unlock access to private repositories, issues, pull requests, and more.
                </p>
              {/if}

              <div class="subscription-actions mt-4">
                <!-- State: incomplete -->
                {#if subscriptionState?.state === 'incomplete'}
                  {#if canDoAction('continue_payment')}
                    <button
                      class="btn btn-primary tooltip-trigger"
                      on:click={handleManageBilling}
                    >
                      Complete Payment
                      <span class="tooltip">Complete the payment that was interrupted</span>
                    </button>
                  {/if}
                  {#if canDoAction('start_over')}
                    <button
                      class="btn btn-secondary tooltip-trigger"
                      on:click={handleStartOver}
                      disabled={startingOver}
                    >
                      {startingOver ? 'Redirecting...' : 'Start Over'}
                      <span class="tooltip">Cancel the previous payment and start a new checkout</span>
                    </button>
                  {/if}
                  {#if canDoAction('cancel')}
                    <button
                      class="btn btn-danger tooltip-trigger"
                      on:click={handleCancel}
                      disabled={canceling}
                    >
                      {canceling ? 'Canceling...' : 'Cancel'}
                      <span class="tooltip">Cancel the incomplete subscription without starting a new one</span>
                    </button>
                  {/if}

                <!-- State: past_due -->
                {:else if subscriptionState?.state === 'past_due'}
                  {#if canDoAction('update_payment')}
                    <button class="btn btn-primary" on:click={handleManageBilling}>
                      Update Payment
                    </button>
                  {/if}
                  {#if canDoAction('cancel')}
                    <button
                      class="btn btn-danger tooltip-trigger"
                      on:click={handleCancel}
                      disabled={canceling}
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                      <span class="tooltip">Cancel subscription immediately</span>
                    </button>
                  {/if}

                <!-- State: canceled -->
                {:else if subscriptionState?.state === 'canceled'}
                  {#if canDoAction('resubscribe')}
                    <button class="btn btn-primary" on:click={handleSubscribe} disabled={subscribing}>
                      {subscribing ? 'Redirecting...' : 'Resubscribe'}
                    </button>
                  {/if}

                <!-- State: none -->
                {:else}
                  {#if canDoAction('subscribe')}
                    <button class="btn btn-primary" on:click={handleSubscribe} disabled={subscribing}>
                      {subscribing ? 'Redirecting...' : 'Subscribe Now'}
                    </button>
                  {/if}
                {/if}

                <!-- Refresh button (always available) -->
                <button class="btn btn-secondary" on:click={handleSync} disabled={syncing || syncCooldown > 0}>
                  {#if syncing}
                    Refreshing...
                  {:else if syncCooldown > 0}
                    Refresh ({syncCooldown}s)
                  {:else}
                    Refresh
                  {/if}
                </button>
              </div>

              {#if syncResult}
                <div class="sync-result mt-2 {syncResult.status === 'error' ? 'sync-error' : syncResult.status === 'rate_limited' ? 'sync-rate-limited' : syncResult.changed ? 'sync-changed' : 'sync-confirmed'}">
                  {syncResult.message}
                </div>
              {/if}
            {/if}
          </div>
        </div>

        <div class="card mt-8">
          <h3>Download Octopunk</h3>
          <p class="text-secondary mt-4">
            Download the Octopunk desktop app to get started.
          </p>
          <div class="stream-select mt-4">
            <label for="stream-select">Release channel</label>
            <select id="stream-select" bind:value={selectedStream} on:change={onStreamChange}>
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
            </select>
            {#if release?.version}
              <span class="text-secondary">{release.version}</span>
            {/if}
          </div>
          <div class="download-buttons mt-4">
            {#if release}
              {#if detected}
                {@const primary = getDownloadForPlatform(release, detected.platform)}
                {#if primary}
                  <a href={primary.download_url} class="btn btn-primary">Download for {detected.os}</a>
                {/if}
              {/if}
              {#each ALL_PLATFORMS as plat}
                {#if plat.platform !== detected?.platform}
                  {@const artifact = getDownloadForPlatform(release, plat.platform)}
                  {#if artifact}
                    <a href={artifact.download_url} class="btn btn-secondary">{plat.label}</a>
                  {/if}
                {/if}
              {/each}
            {:else}
              <!-- Source repo is private; don't fall back to github.com/.../releases. -->
              <button class="btn btn-primary" disabled>No {selectedStream} release available yet</button>
            {/if}
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
    gap: 10px;
    text-decoration: none;
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

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  .user-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--color-border-primary);
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
  }

  .user-name-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-header h2 {
    font-size: 24px;
    font-weight: 600;
  }

  .admin-badge {
    display: inline-block;
    padding: 3px 8px;
    font-size: var(--font-size-label);
    font-weight: 500;
    background-color: var(--color-accent-subtle);
    color: var(--color-accent-text);
    border-radius: var(--radius-xl);
  }

  .subscription-card h3 {
    font-size: 18px;
    font-weight: 600;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-active {
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
  }

  .status-canceling {
    background-color: var(--color-warning-subtle);
    color: var(--color-warning-text);
  }

  .status-inactive {
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
  }

  .status-warning {
    background-color: var(--color-warning-subtle);
    color: var(--color-warning-text);
  }

  .status-error {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
  }

  .text-warning {
    color: var(--color-warning-text);
  }

  .subscription-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Tooltip styles */
  .tooltip-trigger {
    position: relative;
  }

  .tooltip-trigger .tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
    z-index: 1000;
    border: 1px solid var(--color-border-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: opacity 0.15s ease, visibility 0.15s ease;
    pointer-events: none;
  }

  .tooltip-trigger .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--color-border-primary);
  }

  .tooltip-trigger:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  /* Danger button style */
  .btn-danger {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
    border: 1px solid var(--color-danger-border, rgba(248, 81, 73, 0.4));
  }

  .btn-danger:hover:not(:disabled) {
    background-color: var(--color-danger-emphasis, #da3633);
    color: #fff;
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .download-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .stream-select {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .stream-select label {
    color: var(--color-text-secondary, inherit);
  }

  .stream-select select {
    padding: 4px 8px;
    border: 1px solid var(--color-border, #d0d7de);
    border-radius: 6px;
    background: var(--color-surface, #fff);
    color: var(--color-text, inherit);
    font-size: 14px;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 6px;
  }

  .alert-success {
    background-color: var(--color-success-subtle);
    border: 1px solid var(--color-success-border);
    color: var(--color-success-text);
  }

  .alert-warning {
    background-color: var(--color-warning-subtle);
    border: 1px solid var(--color-warning-border);
    color: var(--color-warning-text);
  }

  .sync-result {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    animation: fadeIn 0.2s ease;
  }

  .sync-confirmed {
    background-color: var(--color-component-bg);
    color: var(--color-text-secondary);
  }

  .sync-changed {
    background-color: var(--color-success-subtle);
    color: var(--color-success-text);
  }

  .sync-error {
    background-color: var(--color-danger-subtle);
    color: var(--color-danger-text);
  }

  .sync-rate-limited {
    background-color: var(--color-warning-subtle);
    color: var(--color-warning-text);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
