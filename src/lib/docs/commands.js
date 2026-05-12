/**
 * Command metadata referenced by docs via the `:command[id]` directive.
 *
 * Mirrors the desktop app's static registry at
 * `octopunk/src/lib/stores/commandDefinitions.js`. Hand-curated for now —
 * if this grows past a handful of entries, generate it at build time from
 * the desktop registry to avoid drift.
 */
export const commands = {
  'open-ai-panel': {
    label: 'Open AI Assistant',
    description: 'Toggle the AI assistant panel',
    // sparkle-fill matches OctoPunk's own AI surfaces (SettingsPage). The
    // desktop's commandDefinitions.js still has 'copilot' here — that's a bug
    // on the desktop side and should be aligned to sparkle-fill there too.
    icon: 'sparkle-fill'
  },
  'open-omnibar': {
    label: 'Open Omnibar',
    description: 'Quick navigation to issues and PRs',
    icon: 'search'
  },
  'global-settings': {
    label: 'Settings',
    description: 'Open application settings',
    icon: 'gear'
  },
  'global-notifications': {
    label: 'Show Notifications',
    description: 'Open the notifications page',
    icon: 'bell'
  }
};
