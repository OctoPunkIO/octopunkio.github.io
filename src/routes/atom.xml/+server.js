import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { SITE_URL, SITE_NAME } from '$lib/seo.js';
import { parseFrontmatter, stripFrontmatter, formatTitle } from '$lib/markdown.js';

export const prerender = true;

const BLOG_DIR = path.join(process.cwd(), 'blog');
const FEED_URL = `${SITE_URL}/atom.xml`;
const FEED_ID = `${SITE_URL}/`;

// Atom requires XML-escaped text in element bodies.
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Atom dates must be RFC 3339. Fall back to epoch zero so the feed stays
// well-formed even for posts that forgot to set a date.
function isoDate(input) {
  if (!input) return new Date(0).toISOString();
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

async function loadPosts() {
  let entries;
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch {
    return [];
  }
  const posts = [];
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    const slug = name.replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(BLOG_DIR, name), 'utf-8');
    const meta = parseFrontmatter(raw);
    const markdown = stripFrontmatter(raw);
    posts.push({
      slug,
      title: meta.title || formatTitle(slug),
      date: meta.date || null,
      author: meta.author || SITE_NAME,
      excerpt: meta.excerpt || '',
      html: marked.parse(markdown)
    });
  }
  // Newest first; undated posts sink to the bottom so they don't bury real posts.
  posts.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return posts;
}

export async function GET() {
  const posts = await loadPosts();
  const updated = isoDate(posts[0]?.date || new Date());

  const entries = posts.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const published = isoDate(post.date);
    return `  <entry>
    <id>${escapeXml(url)}</id>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(url)}" />
    <updated>${published}</updated>
    <published>${published}</published>
    <author><name>${escapeXml(post.author)}</name></author>
${post.excerpt ? `    <summary>${escapeXml(post.excerpt)}</summary>\n` : ''}    <content type="html">${escapeXml(post.html)}</content>
  </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(FEED_ID)}</id>
  <title>${escapeXml(SITE_NAME)} Blog</title>
  <subtitle>Notes, releases, and assorted thoughts from the Octopunk team.</subtitle>
  <link href="${escapeXml(FEED_URL)}" rel="self" type="application/atom+xml" />
  <link href="${escapeXml(SITE_URL + '/blog')}" rel="alternate" type="text/html" />
  <updated>${updated}</updated>
  <author><name>${escapeXml(SITE_NAME)}</name></author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' }
  });
}
