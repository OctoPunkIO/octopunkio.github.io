import octicons from '@primer/octicons';
import { commands } from './commands.js';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function octiconSvg(name, size = 16) {
  const icon = octicons[name];
  if (!icon) return '';
  return icon.toSVG({ width: size, height: size });
}

/**
 * `:command[id]` — renders an inline card mirroring a command palette entry.
 *
 * Looks `id` up in commands.js and emits icon + label + a small "⌘ ▸" badge
 * indicating the action lives in the desktop command palette. Unknown ids
 * render a visible warning so authors notice in dev.
 */
export const commandDirective = {
  name: 'command',
  level: 'inline',
  start(src) {
    const i = src.indexOf(':command[');
    return i === -1 ? undefined : i;
  },
  tokenizer(src) {
    const match = /^:command\[([a-z0-9-]+)\]/.exec(src);
    if (!match) return undefined;
    return {
      type: 'command',
      raw: match[0],
      id: match[1]
    };
  },
  renderer(token) {
    const cmd = commands[token.id];
    if (!cmd) {
      return `<span class="cmd-card cmd-card-unknown" title="Unknown command id">unknown command: ${escapeHtml(token.id)}</span>`;
    }
    const icon = octiconSvg(cmd.icon, 14);
    const label = escapeHtml(cmd.label);
    const title = escapeHtml(`${cmd.label} — ${cmd.description}`);
    return (
      `<span class="cmd-card" title="${title}">` +
        `<span class="cmd-card-badge" aria-label="In command palette">⌘+P</span>` +
        `<span class="cmd-card-icon">${icon}</span>` +
        `<span class="cmd-card-label">${label}</span>` +
      `</span>`
    );
  }
};

/**
 * `:key[KEY]` — renders a small kbd chip for a raw key or modifier.
 *
 * Use this for modifier-hold semantics (e.g. holding ALT to focus an element)
 * where the action isn't a command palette entry.
 */
export const keyDirective = {
  name: 'key',
  level: 'inline',
  start(src) {
    const i = src.indexOf(':key[');
    return i === -1 ? undefined : i;
  },
  tokenizer(src) {
    const match = /^:key\[([^\]]+)\]/.exec(src);
    if (!match) return undefined;
    return {
      type: 'key',
      raw: match[0],
      key: match[1]
    };
  },
  renderer(token) {
    return `<kbd class="key-chip">${escapeHtml(token.key)}</kbd>`;
  }
};

export const docDirectives = [commandDirective, keyDirective];
