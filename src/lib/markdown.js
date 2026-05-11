/**
 * Parse YAML frontmatter from the head of a markdown string.
 * Mirrors the parser inlined in src/routes/docs/[...slug]/+page.server.js
 * so both docs and blog accept the same author-facing format.
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!isNaN(value) && value !== '') {
        value = Number(value);
      }
      frontmatter[key.trim()] = value;
    }
  }
  return frontmatter;
}

/** Strip the frontmatter block, returning just the markdown body. */
export function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

/** Turn `my-cool-post` into `My Cool Post` for default titles. */
export function formatTitle(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
