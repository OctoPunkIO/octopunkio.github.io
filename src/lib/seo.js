// Central SEO config + helpers. Per-route metadata flows into <Seo>, which
// emits <title>/<meta>/<link rel=canonical> + OG/Twitter cards into the
// prerendered HTML.

export const SITE_URL = 'https://www.octopunk.io';
export const SITE_NAME = 'Octopunk';
export const DEFAULT_TITLE = 'Octopunk — A GitHub Desktop alternative for power users';
export const DEFAULT_DESCRIPTION =
  'Octopunk is a keyboard-driven GitHub client for Mac, Linux, and Windows. Fuzzy search across repos, custom dashboards, LSP-aware PR review, and an AI assistant — a GitHub Desktop alternative that finally works like your editor.';
export const DEFAULT_OG_IMAGE = '/og-cover.png';

/**
 * Build a canonical URL from a route path. Strips query strings and trailing
 * slashes (except for the root) so equivalent URLs collapse to one canonical.
 */
export function canonicalFor(pathname) {
  if (!pathname || pathname === '/') return SITE_URL + '/';
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return SITE_URL + (clean.startsWith('/') ? clean : '/' + clean);
}

/**
 * Resolve a possibly-relative image path to an absolute URL. OG/Twitter
 * scrapers reject relative URLs.
 */
export function absoluteImage(src) {
  if (!src) return SITE_URL + DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(src)) return src;
  return SITE_URL + (src.startsWith('/') ? src : '/' + src);
}
