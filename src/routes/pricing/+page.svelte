<script>
  import { onMount } from 'svelte';
  import { getPricing } from '$lib/api.js';
  import { detectOS, ALL_PLATFORMS, fetchLatestDownloads, getDownloadForPlatform, getStreamFromURL } from '$lib/downloads.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Seo from '$lib/components/Seo.svelte';

  let detected = null;
  let release = null;
  let dropdownOpen = false;
  let dropdownButton;

  // Pricing state
  let pricing = null;
  let pricingError = null;
  let pricingLoading = true;
  let billingInterval = 'monthly'; // 'monthly' or 'annual'

  // Fallback prices if API fails
  const FALLBACK_PRICES = {
    monthly: { amount: 9 },
    annual: { amount: 90 },
    discount_percent: 17
  };

  $: primaryDownload = detected && release ? getDownloadForPlatform(release, detected.platform) : null;

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  function handleClickOutside(event) {
    if (dropdownOpen && dropdownButton && !dropdownButton.contains(event.target)) {
      closeDropdown();
    }
  }

  function getArtifactUrl(platform) {
    const artifact = getDownloadForPlatform(release, platform);
    return artifact?.download_url || null;
  }

  // Determine which prices are available
  $: hasMonthly = pricing?.monthly != null;
  $: hasAnnual = pricing?.annual != null;
  $: hasBothPrices = hasMonthly && hasAnnual;

  // Auto-select the available interval if only one exists
  $: {
    if (!pricingLoading && pricing) {
      if (hasMonthly && !hasAnnual) {
        billingInterval = 'monthly';
      } else if (hasAnnual && !hasMonthly) {
        billingInterval = 'annual';
      }
    }
  }

  // Get the current price based on selected interval
  $: currentPrice = pricing
    ? (billingInterval === 'monthly' ? pricing.monthly : pricing.annual)
    : (billingInterval === 'monthly' ? FALLBACK_PRICES.monthly : FALLBACK_PRICES.annual);

  $: displayPrice = currentPrice?.amount ?? (billingInterval === 'monthly' ? 9 : 90);
  $: discountPercent = pricing?.discount_percent ?? FALLBACK_PRICES.discount_percent;

  // Period label for display
  $: periodLabel = billingInterval === 'monthly' ? 'month' : 'year';

  onMount(async () => {
    detected = await detectOS();
    release = await fetchLatestDownloads(getStreamFromURL());

    document.addEventListener('click', handleClickOutside);

    // Fetch pricing from API
    try {
      pricing = await getPricing();
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      pricingError = err.message;
      pricing = null;
    } finally {
      pricingLoading = false;
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<Seo
  title="Pricing"
  description="OctoPunk is free for public repositories on Mac, Linux, and Windows. Subscribe to unlock private repositories — fixed monthly or annual pricing, no surprises."
/>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container">
      <section class="pricing-hero text-center">
        <h1>Pricing</h1>
        <p class="text-secondary mt-4">
          Fixed pricing, no surprises, as easy as it gets.
        </p>
      </section>

      <section class="pricing-cards mt-8">
        <div class="pricing-grid">
          <!-- Open Source -->
          <div class="pricing-card">
            <div class="pricing-card-header">
              <h3>Open Source</h3>
              <p class="pricing-tagline">All features, for free, forever</p>
            </div>
            <div class="pricing-card-price">
              <span class="price">$0</span>
              <span class="period">/month</span>
            </div>
            <ul class="pricing-features">
              <li>Full access to all features</li>
              <li>Unlimited public repositories</li>
              <li>Fuzzy search & keyboard shortcuts</li>
              <li>Custom filters & saved views</li>
              <li>No time limits, no restrictions</li>
            </ul>
            <div class="pricing-card-footer">
              {#if !release}
                <!-- Source repo is private; don't fall back to github.com/.../releases. -->
                <button class="btn btn-secondary btn-block" disabled>
                  Downloads coming soon
                </button>
              {:else if detected && primaryDownload}
                <a href={primaryDownload.download_url} class="btn btn-secondary btn-block">
                  Download for {detected.os}
                </a>
              {:else}
                <div class="download-dropdown" bind:this={dropdownButton}>
                  <button class="btn btn-secondary btn-block" on:click={toggleDropdown}>
                    Download OctoPunk
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" class="chevron" class:open={dropdownOpen}>
                      <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"/>
                    </svg>
                  </button>
                  {#if dropdownOpen}
                    <div class="dropdown-menu">
                      {#each ALL_PLATFORMS as plat}
                        {@const url = getArtifactUrl(plat.platform)}
                        {#if url}
                          <a href={url} class="dropdown-item" on:click={closeDropdown}>
                            {plat.label}
                          </a>
                        {/if}
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <!-- Pro -->
          <div class="pricing-card featured">
            <div class="pricing-card-badge">Most Popular</div>
            <div class="pricing-card-header">
              <h3>Pro</h3>
              <p class="pricing-tagline">For professional developers</p>
            </div>

            {#if pricingLoading}
              <div class="pricing-card-price">
                <span class="price price-loading">...</span>
              </div>
            {:else if pricing}
              <!-- Billing Toggle - only show if both monthly AND annual prices exist -->
              {#if hasBothPrices}
                <div class="billing-toggle">
                  <button
                    class="toggle-btn"
                    class:active={billingInterval === 'monthly'}
                    on:click={() => billingInterval = 'monthly'}
                  >
                    Monthly
                  </button>
                  <button
                    class="toggle-btn"
                    class:active={billingInterval === 'annual'}
                    on:click={() => billingInterval = 'annual'}
                  >
                    Annual
                    {#if discountPercent > 0}
                      <span class="discount-badge">Save {discountPercent}%</span>
                    {/if}
                  </button>
                </div>
              {/if}

              <div class="pricing-card-price">
                <span class="price">${displayPrice}</span>
                <span class="period">/{periodLabel}</span>
              </div>
            {:else}
              <div class="pricing-card-price">
                <span class="price price-coming-soon">Pricing coming soon</span>
              </div>
            {/if}

            <ul class="pricing-features">
              <li>Everything in Open Source</li>
              <li>Unlimited private repositories</li>
              <li>Private issues & pull requests</li>
              <li>Priority support</li>
              <li>Early access to new features</li>
            </ul>
            <div class="pricing-card-footer">
              {#if pricing}
                <a href="/dashboard?interval={billingInterval}" class="btn btn-primary btn-block">Subscribe with GitHub</a>
              {:else}
                <button class="btn btn-primary btn-block" disabled>Coming Soon</button>
              {/if}
            </div>
          </div>

          <!-- Enterprise -->
          <div class="pricing-card">
            <div class="pricing-card-header">
              <h3>Enterprise</h3>
              <p class="pricing-tagline">For teams & organizations</p>
            </div>
            <div class="pricing-card-price">
              <span class="price">Variable</span>
            </div>
            <ul class="pricing-features">
              <li>Everything in Pro</li>
              <li>GitHub organization wide access</li>
              <li>Dedicated support</li>
            </ul>
            <div class="pricing-card-footer">
              <a href="mailto:support@octopunk.io" class="btn btn-secondary btn-block">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <Footer />
</div>

<style>
  .pricing-hero h1 {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1px;
  }

  .pricing-hero p {
    font-size: 18px;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .pricing-card {
    position: relative;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 12px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
  }

  .pricing-card.featured {
    border-color: #a855f7;
    box-shadow: 0 0 24px rgba(168, 85, 247, 0.2);
  }

  .pricing-card-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(90deg, #a855f7, #ec4899);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 12px;
  }

  .pricing-card-header {
    margin-bottom: 16px;
  }

  .pricing-card-header h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .pricing-tagline {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  /* Billing Toggle */
  .billing-toggle {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding: 4px;
    background: var(--color-bg-tertiary);
    border-radius: 8px;
  }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toggle-btn:hover {
    color: var(--color-text-primary);
  }

  .toggle-btn.active {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .discount-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    color: white;
    white-space: nowrap;
  }

  .pricing-card-price {
    margin-bottom: 24px;
  }

  .price {
    font-size: 48px;
    font-weight: 700;
  }

  .price-loading {
    opacity: 0.5;
  }

  .price-coming-soon {
    font-size: 20px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .period {
    font-size: 16px;
    color: var(--color-text-secondary);
  }

  .pricing-features {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
    flex-grow: 1;
  }

  .pricing-features li {
    padding: 8px 0;
    padding-left: 24px;
    position: relative;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .pricing-features li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%2322c55e'%3E%3Cpath d='M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z'/%3E%3C/svg%3E");
    background-size: contain;
  }

  .pricing-card-footer {
    margin-top: auto;
  }

  .btn-block {
    width: 100%;
    justify-content: center;
  }

  .btn-secondary {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-primary);
  }

  .btn-secondary:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-secondary);
  }

  .download-dropdown {
    position: relative;
  }

  .download-dropdown .chevron {
    margin-left: 4px;
    transition: transform 0.2s ease;
  }

  .download-dropdown .chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .dropdown-item:hover {
    background: var(--color-bg-tertiary);
  }

  .dropdown-item-ext {
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .pricing-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .pricing-hero h1 {
      font-size: 32px;
      letter-spacing: -0.5px;
    }
    .pricing-hero p {
      font-size: 16px;
    }
    .price {
      font-size: 36px;
    }
  }
</style>
