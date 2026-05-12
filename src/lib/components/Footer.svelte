<footer class="page-footer">
  <div class="container footer-row">
    <p class="footer-copy text-secondary">&copy; 2025 Octopunk. All rights reserved.</p>
    <nav class="footer-social" aria-label="Social">
      <a
        href="https://www.linkedin.com/company/octopunk"
        target="_blank"
        rel="noopener"
        aria-label="Octopunk on LinkedIn"
        class="footer-social-link"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.356V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </nav>
  </div>
</footer>

<style>
  .page-footer {
    padding: 24px 0;
    border-top: 1px solid var(--color-border-primary);
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .footer-copy {
    margin: 0;
    text-align: center;
    flex: 1;
  }

  .footer-social {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .footer-social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    color: var(--color-text-secondary);
    transition: color 0.15s ease, background 0.15s ease;
  }

  .footer-social-link:hover {
    color: var(--color-text-primary);
    background: var(--color-component-bg);
  }
</style>
