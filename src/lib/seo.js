// Central SEO config + helpers. Per-route metadata flows into <Seo>, which
// emits <title>/<meta>/<link rel=canonical> + OG/Twitter cards into the
// prerendered HTML.

export const SITE_URL = 'https://www.octopunk.io';
export const SITE_NAME = 'OctoPunk';
export const DEFAULT_TITLE = 'OctoPunk — A GitHub Desktop alternative for power users';
// Length kept under 160 chars so it doesn't get truncated in Google SERPs or
// flagged as too-long by Bing Webmaster Tools.
export const DEFAULT_DESCRIPTION =
  'A keyboard-driven GitHub client for the desktop. Notifications, full PR review, projects, discussions — a GitHub Desktop alternative for power users.';
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
