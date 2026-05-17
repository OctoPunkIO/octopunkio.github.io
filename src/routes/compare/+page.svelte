<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { FEATURES, TOOLS } from '$lib/data/comparison.js';

  // The matrix's job is to make breadth pop visually. Map each cell value
  // to a glyph and an aria-label rather than relying on color alone — the
  // page needs to read sensibly with CSS disabled and to screen readers.
  const CELL = {
    yes:     { glyph: '✓', label: 'Yes',                 className: 'cell-yes' },
    partial: { glyph: '◐', label: 'Partial',             className: 'cell-partial' },
    no:      { glyph: '–', label: 'No',                  className: 'cell-no' }
  };

  function cellOf(value) {
    return CELL[value] || { glyph: '–', label: '—', className: 'cell-no' };
  }
</script>

<Seo
  title="GitHub Desktop alternatives"
  description="An honest comparison of OctoPunk against GitHub Desktop, GitKraken, the VS Code Pull Requests extension, and JetBrains' GitHub plugin. The only desktop GitHub client that covers notifications, PR review, issues, projects, discussions, and actions in one window."
/>

<div class="page">
  <Header />

  <main class="page-content">
    <div class="container compare-container">
      <section class="compare-hero">
        <h1>GitHub Desktop alternatives</h1>
        <p class="lede">
          OctoPunk is the only full-featured GitHub client for the desktop.
        </p>
        <p class="sublede">
          Every other "GitHub client" covers a slice — pull requests in your editor,
          notifications in your menubar, or a friendlier wrapper around <code>git push</code>.
          OctoPunk covers the whole platform: notifications, PR review, issues, projects,
          discussions, and actions, in one window.
        </p>
      </section>

      <section class="compare-matrix-section">
        <div class="table-scroll">
          <table class="compare-matrix">
            <thead>
              <tr>
                <th class="th-tool" scope="col">Tool</th>
                {#each FEATURES as f}
                  <th class="th-feature" scope="col" title={f.tooltip}>
                    <span class="th-feature-label">{f.label}</span>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each TOOLS as tool}
                <tr class:row-us={tool.isUs}>
                  <th class="th-tool-name" scope="row">
                    <a href={tool.url} class="tool-link" target={tool.url.startsWith('/') ? null : '_blank'} rel={tool.url.startsWith('/') ? null : 'noopener'}>
                      {tool.name}
                    </a>
                  </th>
                  {#each FEATURES as f}
                    {@const c = cellOf(tool.features[f.key])}
                    <td class={c.className}>
                      <span class="cell-glyph" aria-label={c.label}>{c.glyph}</span>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="legend">
          <span><span class="legend-glyph cell-yes">✓</span> yes</span>
          <span><span class="legend-glyph cell-partial">◐</span> partial</span>
          <span><span class="legend-glyph cell-no">–</span> no</span>
        </p>
      </section>

      <section class="compare-rowcards">
        <h2>The rows, explained</h2>
        {#each TOOLS as tool}
          <article class="rowcard" class:rowcard-us={tool.isUs}>
            <header class="rowcard-head">
              <h3>
                <a href={tool.url} target={tool.url.startsWith('/') ? null : '_blank'} rel={tool.url.startsWith('/') ? null : 'noopener'}>
                  {tool.name}
                </a>
              </h3>
              <span class="rowcard-pricing">{tool.pricing}</span>
            </header>
            <p class="rowcard-tagline">{tool.tagline}</p>
            <p class="rowcard-note">{tool.note}</p>
          </article>
        {/each}
      </section>

      <section class="compare-cta">
        <h2>Try OctoPunk</h2>
        <p>Free for public repositories. Mac, Linux, and Windows.</p>
        <a href="/" class="btn btn-primary btn-large">Get OctoPunk</a>
      </section>
    </div>
  </main>

  <Footer />
</div>

<style>
  .compare-container {
    max-width: 1100px;
    padding-top: 48px;
    padding-bottom: 80px;
  }

  .compare-hero {
    text-align: center;
    margin-bottom: 48px;
  }

  .compare-hero h1 {
    font-size: 44px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .lede {
    margin-top: 16px;
    font-size: 20px;
    color: var(--color-text-primary);
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.55;
  }

  .sublede {
    margin-top: 12px;
    font-size: 15px;
    color: var(--color-text-secondary);
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  /* Matrix */
  .table-scroll {
    overflow-x: auto;
    border: 1px solid var(--color-border-primary);
    border-radius: 10px;
    background: var(--color-bg-secondary);
  }

  .compare-matrix {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    min-width: 760px;
  }

  .compare-matrix th,
  .compare-matrix td {
    padding: 10px 8px;
    text-align: center;
    border-bottom: 1px solid var(--color-border-primary);
  }

  .compare-matrix tbody tr:last-child th,
  .compare-matrix tbody tr:last-child td {
    border-bottom: none;
  }

  .th-tool {
    text-align: left;
    padding-left: 18px;
    width: 200px;
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--color-bg-tertiary);
  }

  .th-feature {
    font-weight: 500;
    color: var(--color-text-secondary);
    font-size: 12px;
    background: var(--color-bg-tertiary);
    white-space: normal;
    line-height: 1.3;
    min-width: 76px;
  }

  .th-feature-label {
    display: block;
  }

  .th-tool-name {
    text-align: left;
    padding-left: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
  }

  .tool-link {
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .tool-link:hover {
    color: var(--color-text-link);
  }

  .row-us {
    background:
      linear-gradient(90deg,
        rgba(168, 85, 247, 0.08),
        rgba(236, 72, 153, 0.06),
        rgba(249, 115, 22, 0.06)
      );
  }

  .row-us .th-tool-name {
    background: transparent;
    color: #ec4899;
  }

  .cell-glyph {
    display: inline-block;
    font-size: 18px;
    line-height: 1;
  }

  .cell-yes      { color: #22c55e; }
  .cell-partial  { color: #eab308; }
  .cell-no       { color: var(--color-text-tertiary); }

  .legend {
    margin-top: 14px;
    display: flex;
    justify-content: center;
    gap: 22px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .legend-glyph {
    display: inline-block;
    margin-right: 4px;
    font-size: 16px;
    line-height: 1;
  }

  /* Row cards */
  .compare-rowcards {
    margin-top: 64px;
  }

  .compare-rowcards h2,
  .compare-cta h2 {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 20px;
  }

  .rowcard {
    padding: 20px 22px;
    margin-bottom: 14px;
    border: 1px solid var(--color-border-primary);
    border-radius: 10px;
    background: var(--color-bg-secondary);
  }

  .rowcard-us {
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 0 24px -8px rgba(168, 85, 247, 0.4);
  }

  .rowcard-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .rowcard-head h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .rowcard-head a {
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .rowcard-head a:hover {
    color: var(--color-text-link);
  }

  .rowcard-pricing {
    font-size: 12px;
    color: var(--color-text-tertiary);
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    background: var(--color-bg-tertiary);
  }

  .rowcard-tagline {
    margin-top: 10px;
    color: var(--color-text-primary);
    font-size: 15px;
    line-height: 1.55;
  }

  .rowcard-note {
    margin-top: 8px;
    color: var(--color-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }

  /* CTA */
  .compare-cta {
    margin-top: 64px;
    padding: 32px 24px;
    text-align: center;
    border: 1px solid var(--color-border-primary);
    border-radius: 12px;
    background: var(--color-bg-secondary);
  }

  .compare-cta p {
    margin-top: 8px;
    margin-bottom: 20px;
    color: var(--color-text-secondary);
  }

  @media (max-width: 720px) {
    .compare-hero h1 {
      font-size: 32px;
    }
    .lede {
      font-size: 17px;
    }
    .compare-rowcards h2,
    .compare-cta h2 {
      font-size: 22px;
    }
  }
</style>
