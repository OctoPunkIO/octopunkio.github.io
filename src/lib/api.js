// API client for Octopunk backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Check if user is authenticated (has auth cookie)
 * Note: We can't read HttpOnly cookies from JS, so we check by making a request
 */
let cachedAuthStatus = null;

export async function isAuthenticated() {
  if (cachedAuthStatus !== null) return cachedAuthStatus;

  try {
    await getMe();
    cachedAuthStatus = true;
    return true;
  } catch {
    cachedAuthStatus = false;
    return false;
  }
}

/**
 * Clear cached auth status (call after logout)
 */
export function clearAuthCache() {
  cachedAuthStatus = null;
}

/**
 * Make an authenticated API request
 * Uses credentials: 'include' to send HttpOnly cookies
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send cookies with requests
  });

  if (response.status === 401) {
    cachedAuthStatus = false;
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

/**
 * Get current user info
 */
export async function getMe() {
  const data = await apiRequest('/auth/me');
  cachedAuthStatus = true;
  return data;
}

/**
 * Logout
 */
export async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' });
  clearAuthCache();
}

/**
 * Create checkout session
 * @param {Object} options
 * @param {string} [options.interval='monthly'] - Billing interval: 'monthly' or 'annual'
 */
export async function createCheckout({ interval = 'monthly' } = {}) {
  return apiRequest('/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({ interval }),
  });
}

/**
 * Create customer portal session
 */
export async function createPortal() {
  return apiRequest('/subscription/portal', {
    method: 'POST',
  });
}

/**
 * Verify checkout session (belt-and-suspenders activation)
 * Call this after returning from Stripe checkout to ensure subscription is activated
 */
export async function verifyCheckout(sessionId) {
  return apiRequest('/subscription/verify-checkout', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

/**
 * Cancel subscription
 * Cancels the current subscription (useful for incomplete subscriptions)
 */
export async function cancelSubscription() {
  return apiRequest('/subscription/cancel', {
    method: 'POST',
  });
}

/**
 * Sync subscription status with Stripe
 * Forces a refresh of subscription state from Stripe API
 * @throws {Error} with retryAfter property if rate limited
 */
export async function syncSubscription() {
  const response = await fetch(`${API_URL}/subscription/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.status === 401) {
    cachedAuthStatus = false;
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (response.status === 429) {
    // Rate limited - extract retry_after
    const error = new Error(data.error || 'Rate limited');
    error.retryAfter = data.retry_after || 30;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

/**
 * Get subscription state and allowed actions
 * Returns the current state machine state and what actions the user can take
 * @returns {Promise<{state: string, status: string, allowed_actions: string[], current_period_end?: string, cancel_at_period_end: boolean}>}
 */
export async function getSubscriptionState() {
  return apiRequest('/subscription/state');
}

/**
 * Undo a scheduled cancellation
 * Only valid when subscription is in "canceling" state (active + cancel_at_period_end)
 */
export async function undoCancelSubscription() {
  return apiRequest('/subscription/undo-cancel', {
    method: 'POST',
  });
}

/**
 * Get GitHub OAuth URL
 */
export function getGitHubAuthURL() {
  return `${API_URL}/auth/github`;
}

/**
 * Get pricing information (public endpoint)
 * @returns {Promise<{monthly?: {id: string, amount: number, currency: string}, annual?: {id: string, amount: number, currency: string}, discount_percent: number}>}
 */
export async function getPricing() {
  const response = await fetch(`${API_URL}/pricing`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch pricing');
  }
  return response.json();
}

// Admin API

/**
 * Admin login with username/password
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 */
export async function adminLogin(username, password) {
  const response = await apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  cachedAuthStatus = true;
  return response;
}

/**
 * Get admin stats
 */
export async function getAdminStats() {
  return apiRequest('/admin/stats');
}

/**
 * List users (admin)
 */
export async function listUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
}

/**
 * Get user by ID (admin)
 */
export async function getUser(id) {
  return apiRequest(`/admin/users/${id}`);
}

/**
 * Update user (admin)
 */
export async function updateUser(id, data) {
  return apiRequest(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete user (admin)
 */
export async function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}
