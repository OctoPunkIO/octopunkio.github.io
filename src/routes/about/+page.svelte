<script>
  import Header from '$lib/components/Header.svelte';

  let copied = false;

  const SUPPORT_EMAIL = 'support@octopunk.io';

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Clipboard API can fail in some browsers/contexts; the mailto: link still works.
    }
  }
</script>

<svelte:head>
  <title>About - Octopunk</title>
  <meta name="description" content="A small team of developers building the GitHub client we always wanted." />
</svelte:head>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container about-container">
      <section class="about-hero">
        <h2>About Octopunk</h2>
        <p class="lede">A GitHub client for people who'd rather not live in a browser tab.</p>
      </section>

      <section class="about-prose">
        <p>
          Octopunk was built by a small team of developers who got fed up with using GitHub.
        </p>

        <p>
          Living inside a browser tab always felt like a cage. We'd grown used to modern editor
          UX that's fast, keyboard-driven, and never in the way. The GitHub web UI just doesn't
          ship that. So we built it ourselves.
        </p>

        <p>
          Along the way we've fixed a few of GitHub's longest-running annoyances. Like opening
          pull requests with thousands of files without watching the page choke.
        </p>

        <p>
          Yes, we use AI. Everyone is. Most of them shipped it without pausing to ask whether
          they should. We were more deliberate about it. AI lives in the places where it earns
          its keep. Ask the assistant to summarize a sprawling pull request, or explain a comment
          thread you can't quite parse, and you'll get a useful answer in seconds.
        </p>

        <p>
          We're not a typical software company. We're skeptical of big-tech defaults, and we treat
          your privacy and your time as things that actually belong to you, not as engagement
          metrics to be optimized against.
        </p>

        <p>
          Drop by the
          <a href="https://github.com/octopunkio/community" target="_blank" rel="noopener">Octopunk community repo</a>
          to file bugs, request features, or just say hi.
        </p>

        <p class="contact-intro">For anything outside the desktop client, reach us here:</p>
      </section>

      <section class="contact-card">
        <div class="contact-card-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
            <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c.001.138.113.249.25.249h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/>
          </svg>
        </div>
        <div class="contact-card-body">
          <span class="contact-card-label">Support</span>
          <a class="contact-card-email" href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>
        </div>
        <button
          class="contact-card-copy"
          type="button"
          on:click={copyEmail}
          aria-label="Copy email address"
        >
          {#if copied}
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
            </svg>
            Copied
          {:else}
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
            </svg>
            Copy
          {/if}
        </button>
      </section>
    </div>
  </main>
</div>

<style>
  .about-container {
    max-width: 640px;
    padding-top: 64px;
    padding-bottom: 80px;
  }

  .about-hero {
    text-align: center;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--color-border-primary);
  }

  .about-hero h2 {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .lede {
    margin-top: 12px;
    font-size: 18px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .about-prose {
    margin-top: 40px;
  }

  .about-prose p {
    font-size: 16px;
    line-height: 1.7;
    color: var(--color-text-primary);
    margin-top: 18px;
  }

  .about-prose p:first-child {
    margin-top: 0;
  }

  .about-prose a {
    color: var(--color-text-link);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .about-prose a:hover {
    color: var(--color-text-link-hover);
  }

  .contact-intro {
    margin-top: 32px !important;
    color: var(--color-text-secondary);
  }

  .contact-card {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding: 18px 20px;
    border-radius: 10px;
    background:
      linear-gradient(var(--color-bg-secondary), var(--color-bg-secondary)) padding-box,
      linear-gradient(135deg, #a855f7, #ec4899, #f97316) border-box;
    border: 1px solid transparent;
    box-shadow: 0 0 0 1px var(--color-border-primary),
                0 8px 24px -12px rgba(168, 85, 247, 0.35);
  }

  .contact-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(236, 72, 153, 0.18));
    color: var(--color-text-primary);
  }

  .contact-card-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .contact-card-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
  }

  .contact-card-email {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-decoration: none;
    word-break: break-all;
  }

  .contact-card-email:hover {
    color: var(--color-text-link);
  }

  .contact-card-copy {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--color-border-primary);
    background: var(--color-component-bg);
    color: var(--color-text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;
  }

  .contact-card-copy:hover {
    background: var(--color-component-bg-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-secondary);
  }

  .contact-card-copy svg {
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .about-container {
      padding-top: 32px;
    }
    .about-hero h2 {
      font-size: 32px;
    }
    .contact-card {
      flex-wrap: wrap;
    }
    .contact-card-copy {
      margin-left: auto;
    }
  }
</style>
