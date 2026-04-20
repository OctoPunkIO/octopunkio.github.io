import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isAuthenticated,
  clearAuthCache,
  getMe,
  logout,
  createCheckout,
  createPortal,
  verifyCheckout,
  cancelSubscription,
  syncSubscription,
  getSubscriptionState,
  undoCancelSubscription,
  getGitHubAuthURL,
  getAdminStats,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from './api.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import', { meta: { env: { VITE_API_URL: 'http://localhost:8080' } } });

describe('api.js', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    clearAuthCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('returns true when getMe succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123', login: 'testuser' }),
      });

      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('returns false when getMe fails with 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    it('caches the result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });

      await isAuthenticated();
      await isAuthenticated();
      await isAuthenticated();

      // Should only call fetch once due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached value on subsequent calls', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });

      const first = await isAuthenticated();
      const second = await isAuthenticated();

      expect(first).toBe(true);
      expect(second).toBe(true);
    });
  });

  describe('clearAuthCache', () => {
    it('clears cached auth status', async () => {
      // First call - cache the result
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });
      await isAuthenticated();

      // Clear cache
      clearAuthCache();

      // Should make another fetch call now
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });
      await isAuthenticated();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getMe', () => {
    it('returns user data on success', async () => {
      const userData = { id: '123', login: 'testuser', email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(userData),
      });

      const result = await getMe();
      expect(result).toEqual(userData);
    });

    it('calls correct endpoint with credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });

      await getMe();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/auth/me',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('throws on 401 and clears auth cache', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(getMe()).rejects.toThrow('Unauthorized');
    });

    it('throws with error message on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(getMe()).rejects.toThrow('Internal server error');
    });
  });

  describe('logout', () => {
    it('calls logout endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      await logout();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('clears auth cache after logout', async () => {
      // First authenticate
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });
      await isAuthenticated();

      // Logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });
      await logout();

      // isAuthenticated should make a new request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });
      await isAuthenticated();

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('createCheckout', () => {
    it('calls checkout endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/xxx' }),
      });

      const result = await createCheckout();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/subscription/checkout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(result.url).toBe('https://checkout.stripe.com/xxx');
    });
  });

  describe('createPortal', () => {
    it('calls portal endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: 'https://billing.stripe.com/xxx' }),
      });

      const result = await createPortal();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/subscription/portal',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(result.url).toBe('https://billing.stripe.com/xxx');
    });
  });

  describe('verifyCheckout', () => {
    it('sends session_id in body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ state: 'active' }),
      });

      await verifyCheckout('cs_test_123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/subscription/verify-checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ session_id: 'cs_test_123' }),
        })
      );
    });
  });

  describe('cancelSubscription', () => {
    it('calls cancel endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ state: 'none' }),
      });

      await cancelSubscription();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/subscription/cancel',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('syncSubscription', () => {
    it('returns subscription data on success', async () => {
      const subData = { state: 'active', status: 'active' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(subData),
      });

      const result = await syncSubscription();
      expect(result).toEqual(subData);
    });

    it('handles 429 rate limit with retryAfter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limited', retry_after: 45 }),
      });

      try {
        await syncSubscription();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error.message).toBe('Rate limited');
        expect(error.retryAfter).toBe(45);
      }
    });

    it('defaults retryAfter to 30 if not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limited' }),
      });

      try {
        await syncSubscription();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error.retryAfter).toBe(30);
      }
    });

    it('clears auth cache on 401', async () => {
      // First authenticate
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123' }),
      });
      await isAuthenticated();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // syncSubscription returns 401 - this sets cachedAuthStatus to false
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(syncSubscription()).rejects.toThrow('Unauthorized');

      // isAuthenticated returns cached false value (no new fetch)
      const isAuth = await isAuthenticated();
      expect(isAuth).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSubscriptionState', () => {
    it('returns subscription state', async () => {
      const stateData = {
        state: 'active',
        status: 'active',
        allowed_actions: ['cancel', 'manage_billing'],
        cancel_at_period_end: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(stateData),
      });

      const result = await getSubscriptionState();
      expect(result).toEqual(stateData);
    });
  });

  describe('undoCancelSubscription', () => {
    it('calls undo-cancel endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ state: 'active', cancel_at_period_end: false }),
      });

      await undoCancelSubscription();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/subscription/undo-cancel',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('getGitHubAuthURL', () => {
    it('returns correct auth URL', () => {
      const url = getGitHubAuthURL();
      expect(url).toBe('http://localhost:8080/auth/github');
    });
  });

  describe('Admin API', () => {
    describe('getAdminStats', () => {
      it('calls admin stats endpoint', async () => {
        const stats = { total_users: 100, active_subscriptions: 50 };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(stats),
        });

        const result = await getAdminStats();

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/stats',
          expect.any(Object)
        );
        expect(result).toEqual(stats);
      });
    });

    describe('listUsers', () => {
      it('calls users endpoint without params', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ users: [], total: 0 }),
        });

        await listUsers();

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/users',
          expect.any(Object)
        );
      });

      it('includes query params when provided', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ users: [], total: 0 }),
        });

        await listUsers({ page: 2, limit: 10, search: 'test' });

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/users?page=2&limit=10&search=test',
          expect.any(Object)
        );
      });
    });

    describe('getUser', () => {
      it('calls user endpoint with ID', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'abc-123', login: 'testuser' }),
        });

        await getUser('abc-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/users/abc-123',
          expect.any(Object)
        );
      });
    });

    describe('updateUser', () => {
      it('calls user endpoint with PATCH and body', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'abc-123', is_admin: true }),
        });

        await updateUser('abc-123', { is_admin: true });

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/users/abc-123',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ is_admin: true }),
          })
        );
      });
    });

    describe('deleteUser', () => {
      it('calls user endpoint with DELETE', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        });

        await deleteUser('abc-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/admin/users/abc-123',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });
});
