import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseFrontmatter, stripFrontmatter, formatTitle } from '$lib/markdown.js';

const BLOG_DIR = path.join(process.cwd(), 'blog');

/** Tell the prerender which slugs exist. Returning [] keeps the build green
 *  when the blog directory is empty. */
export async function entries() {
  let files;
  try {
    files = await fs.readdir(BLOG_DIR);
  } catch {
    return [];
  }
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.replace(/\.md$/, '') }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params;

  let raw;
  try {
    raw = await fs.readFile(path.join(BLOG_DIR, `${slug}.md`), 'utf-8');
  } catch {
    throw error(404, 'Blog post not found');
  }

  const meta = parseFrontmatter(raw);
  const markdown = stripFrontmatter(raw);

  return {
    slug,
    markdown,
    meta: {
      title: meta.title || formatTitle(slug),
      date: meta.date || null,
      author: meta.author || '',
      excerpt: meta.excerpt || ''
    }
  };
}
