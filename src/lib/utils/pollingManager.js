/**
 * Universal Polling Manager with Wake Detection
 *
 * Centralized polling service for all polling operations in OctoPunk.
 * Provides automatic wake-from-sleep detection, error handling, and
 * flexible interval configuration.
 *
 * Features:
 * - Wake detection (visibilitychange + Electron resume events)
 * - Automatic refresh of stale pollers after sleep
 * - Fixed or adaptive polling intervals
 * - Recursive setTimeout or setInterval patterns
 * - Error handling with logging
 * - Pause/resume without unsubscribing
 * - Observable state (isPolling, lastPollTime, errorCount)
 *
 * Usage:
 * ```javascript
 * import { pollingManager } from '$lib/utils/pollingManager.js';
 *
 * // Simple polling
 * const unsubscribe = pollingManager.startPolling(
 *   'my-poller',
 *   async () => { await fetchData(); }
 * );
 *
 * // Advanced polling with options
 * const unsubscribe = pollingManager.startPolling(
 *   'adaptive-poller',
 *   async () => { await fetchData(); },
 *   {
 *     interval: 30000,        // 30 seconds
 *     immediate: true,        // Call immediately before first poll
 *     getInterval: () => { return isActive ? 10000 : 30000; }, // Adaptive
 *     recursive: false        // Use setTimeout recursion instead of setInterval
 *   }
 * );
 *
 * // Cleanup
 * unsubscribe();
 * ```
 */
class PollingManager {
  constructor() {
    /**
     * Map of active pollers
     * Format: Map<key, { intervalId, callback, config, lastPollTime, errorCount }>
     */
    this.pollers = new Map();

    /**
     * Track if wake detection has been setup (global, once)
     */
    this.wakeDetectionSetup = false;
  }

  /**
   * Start polling with a callback function
   *
   * Wake detection is always enabled - pollers automatically refresh after laptop sleep/wake.
   *
   * @param {string} key - Unique identifier for this polling operation
   * @param {Function} callback - Async function to call on each interval
   * @param {Object|number} options - Configuration options or interval in ms (backward compatible)
   * @param {number} options.interval - Interval in milliseconds (default 30000)
   * @param {boolean} options.immediate - Call callback immediately before first poll (default true)
   * @param {Function} options.getInterval - Function that returns dynamic interval (for adaptive polling)
   * @param {boolean} options.recursive - Use setTimeout recursion instead of setInterval (default false)
   * @returns {Function} Unsubscribe function to stop polling
   */
  startPolling(key, callback, options) {
    // Backward compatibility: if options is a number, treat as interval
    if (typeof options === 'number') {
      options = { interval: options };
    }

    // Default configuration
    const config = {
      interval: options?.interval ?? 30000,
      immediate: options?.immediate !== false,
      getInterval: options?.getInterval || null,
      recursive: options?.recursive || false
    };

    // Prevent duplicate polling
    if (this.pollers.has(key)) {
      console.warn(`[PollingManager] Polling already active for key: ${key}`);
      return () => this.stopPolling(key);
    }

    // Setup global wake detection (once, always enabled)
    if (!this.wakeDetectionSetup) {
      this.setupWakeDetection();
    }

    // Create poller entry
    const poller = {
      callback,
      config,
      intervalId: null,
      lastPollTime: null,
      errorCount: 0,
      isPaused: false
    };

    this.pollers.set(key, poller);

    // Immediate execution
    if (config.immediate) {
      this.executePoll(key);
    }

    // Start interval
    if (config.recursive) {
      this.scheduleNextPoll(key);
    } else {
      poller.intervalId = setInterval(() => this.executePoll(key), config.interval);
    }

    console.log(`[PollingManager] Started polling: ${key} (interval: ${config.interval}ms, recursive: ${config.recursive})`);

    // Return unsubscribe function
    return () => this.stopPolling(key);
  }

  /**
   * Execute poll callback with error handling
   * @private
   */
  async executePoll(key) {
    const poller = this.pollers.get(key);
    if (!poller || poller.isPaused) return;

    try {
      await poller.callback();
      poller.lastPollTime = Date.now();
      poller.errorCount = 0;
    } catch (error) {
      poller.errorCount++;
      console.error(`[PollingManager] Poll error for "${key}" (error #${poller.errorCount}):`, error);
      // Still update last poll time to prevent repeated immediate retries
      poller.lastPollTime = Date.now();
    }
  }

  /**
   * Schedule next poll (for recursive setTimeout pattern)
   * @private
   */
  scheduleNextPoll(key) {
    const poller = this.pollers.get(key);
    if (!poller || poller.isPaused) return;

    // Get interval (either static or dynamic)
    const interval = poller.config.getInterval
      ? poller.config.getInterval()
      : poller.config.interval;

    poller.intervalId = setTimeout(() => {
      this.executePoll(key).then(() => this.scheduleNextPoll(key));
    }, interval);
  }

  /**
   * Stop polling for a key
   * @param {string} key - The polling operation to stop
   */
  stopPolling(key) {
    const poller = this.pollers.get(key);
    if (!poller) return;

    if (poller.intervalId) {
      if (poller.config.recursive) {
        clearTimeout(poller.intervalId);
      } else {
        clearInterval(poller.intervalId);
      }
      poller.intervalId = null;
    }

    this.pollers.delete(key);
    console.log(`[PollingManager] Stopped polling: ${key}`);
  }

  /**
   * Stop all active polling operations
   */
  stopAll() {
    for (const key of Array.from(this.pollers.keys())) {
      this.stopPolling(key);
    }
    console.log(`[PollingManager] Stopped all polling`);
  }

  /**
   * Pause polling for a key (without unsubscribing)
   * Interval continues but callbacks are not executed
   * @param {string} key
   */
  pausePolling(key) {
    const poller = this.pollers.get(key);
    if (!poller || poller.isPaused) return;

    poller.isPaused = true;
    console.log(`[PollingManager] Paused polling: ${key}`);
  }

  /**
   * Resume polling for a key
   * @param {string} key
   */
  resumePolling(key) {
    const poller = this.pollers.get(key);
    if (!poller || !poller.isPaused) return;

    poller.isPaused = false;

    // If using recursive pattern and interval was cleared, restart it
    if (poller.config.recursive && !poller.intervalId) {
      this.scheduleNextPoll(key);
    }

    console.log(`[PollingManager] Resumed polling: ${key}`);
  }

  /**
   * Check if polling is active for a key
   * @param {string} key
   * @returns {boolean}
   */
  isPolling(key) {
    return this.pollers.has(key) && !this.pollers.get(key)?.isPaused;
  }

  /**
   * Get polling info for a key
   * @param {string} key
   * @returns {Object} Polling information
   */
  getPollingInfo(key) {
    const poller = this.pollers.get(key);
    if (!poller) {
      return {
        isPolling: false,
        isPaused: false,
        lastPollTime: null,
        interval: null,
        errorCount: 0
      };
    }

    return {
      isPolling: true,
      isPaused: poller.isPaused,
      lastPollTime: poller.lastPollTime,
      interval: poller.config.interval,
      errorCount: poller.errorCount
    };
  }

  /**
   * Get count of active polling operations
   * @returns {number}
   */
  getActiveCount() {
    return this.pollers.size;
  }

  /**
   * Get list of all active poller keys
   * @returns {string[]}
   */
  getActiveKeys() {
    return Array.from(this.pollers.keys());
  }

  /**
   * Setup wake-from-sleep detection (global, once)
   * Uses same pattern as StateManager and ReactionsPoller for consistency
   * @private
   */
  setupWakeDetection() {
    if (typeof document === 'undefined') return; // Skip in non-browser environments
    if (this.wakeDetectionSetup) return;

    this.wakeDetectionSetup = true;

    // Listen for visibility changes (tab becomes visible after sleep/minimize)
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log('[PollingManager] Tab became visible - checking for stale pollers');
        await this.refreshStalePollers();
      }
    });

    // Listen for Electron system resume events (more reliable for sleep/wake)
    if (typeof window !== 'undefined' && window.systemEvents?.onResume) {
      window.systemEvents.onResume(async () => {
        console.log('[PollingManager] System resumed from sleep (Electron event) - checking for stale pollers');
        await this.refreshStalePollers();
      });
    }

    console.log('[PollingManager] Wake detection setup complete');
  }

  /**
   * Refresh all stale pollers (last poll > 2x interval ago)
   * Called automatically when system wakes from sleep
   * @private
   */
  async refreshStalePollers() {
    const now = Date.now();
    const refreshPromises = [];

    for (const [key, poller] of this.pollers.entries()) {
      // Skip if never polled (will poll on next interval)
      if (!poller.lastPollTime) continue;

      // Skip if paused
      if (poller.isPaused) continue;

      const timeSinceLastPoll = now - poller.lastPollTime;
      const interval = poller.config.getInterval
        ? poller.config.getInterval()
        : poller.config.interval;
      const staleThreshold = interval * 2;

      if (timeSinceLastPoll > staleThreshold) {
        console.log(`[PollingManager] Refreshing stale poller "${key}" (${Math.round(timeSinceLastPoll / 1000)}s since last poll)`);
        refreshPromises.push(this.executePoll(key));
      }
    }

    if (refreshPromises.length > 0) {
      await Promise.all(refreshPromises);
      console.log(`[PollingManager] Refreshed ${refreshPromises.length} stale poller(s)`);
    }
  }
}

/**
 * Singleton instance
 * Import this in components and modules:
 * import { pollingManager } from '$lib/utils/pollingManager.js';
 */
export const pollingManager = new PollingManager();
