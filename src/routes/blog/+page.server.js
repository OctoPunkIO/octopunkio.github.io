import fs from 'fs/promises';
import path from 'path';
import { parseFrontmatter, formatTitle } from '$lib/markdown.js';

const BLOG_DIR = path.join(process.cwd(), 'blog');

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  let entries;
  try {
    entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  } catch {
    return { posts: [] };
  }

  const posts = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const slug = entry.name.replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(BLOG_DIR, entry.name), 'utf-8');
    const meta = parseFrontmatter(raw);

    posts.push({
      slug,
      title: meta.title || formatTitle(slug),
      date: meta.date || null,
      excerpt: meta.excerpt || '',
      author: meta.author || ''
    });
  }

  // Newest first; posts without dates sink to the bottom.
  posts.sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return { posts };
}
