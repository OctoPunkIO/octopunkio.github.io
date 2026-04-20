import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

// In production (Docker), docs is at /app/docs
// In dev, process.cwd() is the web/ directory
const DOCS_DIR = path.join(process.cwd(), 'docs');

/**
 * Recursively get all markdown files in a directory
 */
async function getDocsTree(dir, basePath = '') {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const tree = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		const relativePath = path.join(basePath, entry.name);

		if (entry.isDirectory()) {
			const children = await getDocsTree(fullPath, relativePath);
			// Check if directory has an index.md
			const indexPath = path.join(fullPath, 'index.md');
			let indexMeta = null;
			try {
				const content = await fs.readFile(indexPath, 'utf-8');
				indexMeta = parseFrontmatter(content);
			} catch {
				// No index.md
			}

			tree.push({
				type: 'directory',
				name: entry.name,
				slug: relativePath.replace(/\\/g, '/'),
				title: indexMeta?.title || formatTitle(entry.name),
				order: indexMeta?.order ?? 999,
				children
			});
		} else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
			const content = await fs.readFile(fullPath, 'utf-8');
			const meta = parseFrontmatter(content);
			const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

			tree.push({
				type: 'file',
				name: entry.name,
				slug,
				title: meta.title || formatTitle(entry.name.replace(/\.md$/, '')),
				order: meta.order ?? 999
			});
		}
	}

	// Sort by order, then by title
	return tree.sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return a.title.localeCompare(b.title);
	});
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const frontmatter = {};
	const lines = match[1].split('\n');
	for (const line of lines) {
		const [key, ...valueParts] = line.split(':');
		if (key && valueParts.length) {
			let value = valueParts.join(':').trim();
			// Remove quotes if present
			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			// Parse numbers
			if (!isNaN(value) && value !== '') {
				value = Number(value);
			}
			frontmatter[key.trim()] = value;
		}
	}
	return frontmatter;
}

/**
 * Format a filename into a title
 */
function formatTitle(name) {
	return name
		.replace(/-/g, ' ')
		.replace(/\b\w/g, c => c.toUpperCase());
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const slug = params.slug || 'index';
	const tree = await getDocsTree(DOCS_DIR);

	// Try to find the markdown file
	let filePath = path.join(DOCS_DIR, `${slug}.md`);
	let content;

	try {
		content = await fs.readFile(filePath, 'utf-8');
	} catch {
		// Try as directory with index.md
		filePath = path.join(DOCS_DIR, slug, 'index.md');
		try {
			content = await fs.readFile(filePath, 'utf-8');
		} catch {
			throw error(404, 'Documentation page not found');
		}
	}

	const meta = parseFrontmatter(content);
	// Remove frontmatter from content
	const markdown = content.replace(/^---\n[\s\S]*?\n---\n?/, '');

	return {
		markdown,
		meta,
		slug,
		tree
	};
}
