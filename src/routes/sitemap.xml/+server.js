import fs from 'fs/promises';
import path from 'path';
import { SITE_URL } from '$lib/seo.js';
import { parseFrontmatter } from '$lib/markdown.js';

export const prerender = true;

const BLOG_DIR = path.join(process.cwd(), 'blog');
const DOCS_DIR = path.join(process.cwd(), 'docs');

// Public, indexable routes. Auth-gated ones (dashboard, callback, admin) are
// excluded here and also blocked in robots.txt.
const STATIC_ROUTES = ['/', '/about', '/pricing', '/blog', '/compare'];

async function listBlogSlugs() {
  let entries;
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch {
    return [];
  }
  const slugs = [];
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(BLOG_DIR, name), 'utf-8');
    const meta = parseFrontmatter(raw);
    slugs.push({
      slug: name.replace(/\.md$/, ''),
      date: meta.date || null
    });
  }
  return slugs;
}

async function listDocSlugs(dir = DOCS_DIR, base = '') {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listDocSlugs(full, rel)));
    } else if (entry.name.endsWith('.md')) {
      // `index.md` (at any depth) maps to its parent directory's URL, so
      // strip a trailing `index` segment after dropping the extension.
      const slug = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
      out.push(slug);
    }
  }
  return out;
}

function urlEntry(loc, lastmod) {
  const parts = [`<loc>${loc}</loc>`];
  if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
  return `<url>${parts.join('')}</url>`;
}

export async function GET() {
  const [blog, docs] = await Promise.all([listBlogSlugs(), listDocSlugs()]);

  const urls = [];
  for (const route of STATIC_ROUTES) {
    urls.push(urlEntry(SITE_URL + (route === '/' ? '/' : route)));
  }
  for (const { slug, date } of blog) {
    urls.push(urlEntry(`${SITE_URL}/blog/${slug}`, date || undefined));
  }
  for (const slug of docs) {
    const tail = slug === '' ? '/docs' : `/docs/${slug}`;
    urls.push(urlEntry(SITE_URL + tail));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
