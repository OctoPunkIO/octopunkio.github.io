// Comparison-page source of truth. Edit this file to change anything that
// shows up on /compare — the markup is generic and reads from these arrays.
//
// Cell values: 'yes' | 'partial' | 'no'. Anything else renders as a plain
// dash. Keep claims defensible — every row should be verifiable from the
// linked source, since the whole point of the page is being more honest
// about feature coverage than the competitors are.

export const FEATURES = [
  {
    key: 'platforms',
    label: 'Mac · Win · Linux',
    tooltip: 'Native desktop builds for all three OSes.'
  },
  {
    key: 'free_oss',
    label: 'Free for open source',
    tooltip: 'All features unlocked for public repositories without a paid plan.'
  },
  {
    key: 'inbox',
    label: 'Notifications inbox',
    tooltip: 'A real inbox surface with filters and triage — not just OS-level toasts.'
  },
  {
    key: 'pr_review',
    label: 'Inline PR review',
    tooltip: 'Read the diff, leave line-level comments, and submit Approve / Request changes / Comment without leaving the app.'
  },
  {
    key: 'pr_commitwise',
    label: 'Commit-wise PR review',
    tooltip: 'Review a pull request one commit at a time, not just as a single squashed diff.'
  },
  {
    key: 'issues',
    label: 'Issues triage',
    tooltip: 'Browse, comment on, assign, label, open and close issues from within the app.'
  },
  {
    key: 'projects',
    label: 'Projects (v2)',
    tooltip: "GitHub's modern Projects — board, table, and roadmap views."
  },
  {
    key: 'discussions',
    label: 'Discussions',
    tooltip: 'Browse and post in repository Discussions.'
  },
  {
    key: 'actions',
    label: 'Actions / CI',
    tooltip: 'View workflow runs, inspect logs, and re-run jobs.'
  },
  {
    key: 'search',
    label: 'Cross-repo search',
    tooltip: "Search GitHub's issues, pull requests, and code across all your repositories."
  }
];

export const TOOLS = [
  {
    key: 'github-desktop',
    name: 'GitHub Desktop',
    tagline: "GitHub's official desktop app. Friendly local git GUI; hands off to github.com for anything beyond pushing code.",
    url: 'https://desktop.github.com',
    pricing: 'Free',
    features: {
      platforms: 'partial',  // Mac + Windows; no official Linux build (issue #1525)
      free_oss: 'yes',
      inbox: 'no',
      pr_review: 'no',
      pr_commitwise: 'no',
      issues: 'no',
      projects: 'no',
      discussions: 'no',
      actions: 'partial',     // can re-run checks for the current PR branch only; no cross-repo dashboard
      search: 'no'
    },
    note: 'The docs say it outright: "to leave a review, you will need to navigate to the pull request on GitHub." In-app PR review is a long-standing open feature request that hasn\'t shipped.'
  },
  {
    key: 'vscode-pr',
    name: 'VS Code "GitHub Pull Requests"',
    tagline: 'Official GitHub extension for VS Code. Deep PR review at your cursor — stops at the PR boundary.',
    url: 'https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github',
    pricing: 'Free',
    features: {
      platforms: 'yes',
      free_oss: 'yes',
      inbox: 'partial',        // experimental PR-only notifications view behind a setting flag
      pr_review: 'yes',
      pr_commitwise: 'no',     // open issue #4315, still in "On Deck"
      issues: 'partial',
      projects: 'no',
      discussions: 'no',
      actions: 'no',           // run viewing lives in the separate vscode-github-actions extension
      search: 'partial'
    },
    note: "Inline review is excellent, but commit-wise review (one commit at a time within a PR) isn't supported. An experimental PR-notifications view exists behind a setting flag — PR-scoped only, not the full GitHub inbox — and there's no surface for Projects, Discussions, or Actions."
  },
  {
    key: 'jetbrains',
    name: 'JetBrains GitHub integration',
    tagline: 'Bundled with every IntelliJ-family IDE. Solid in-IDE PR review surface; nothing beyond it.',
    url: 'https://www.jetbrains.com/help/idea/github.html',
    pricing: 'Free in the IDE',
    features: {
      platforms: 'yes',
      free_oss: 'yes',
      inbox: 'no',
      pr_review: 'yes',
      pr_commitwise: 'partial', // PR view lets you filter changes to a single commit — functionally commit-wise, but a filter rather than a true commit stepper
      issues: 'partial',
      projects: 'no',
      discussions: 'no',
      actions: 'no',            // YAML schema + completion for workflow files; no run viewer, no logs, no re-run. Cross-repo dashboards only via 3rd-party plugins.
      search: 'no'
    },
    note: "Inline PR review with Approve / Request changes / Comment works well. \"Actions\" support is only YAML editing for workflow files — no run dashboard, no logs, no re-run."
  },
  {
    key: 'gitkraken',
    name: 'GitKraken Desktop',
    tagline: 'Git GUI with a multi-provider PR/issue feed and integrated AI agents.',
    url: 'https://www.gitkraken.com/git-client',
    pricing: 'Free public repos · paid for private + Launchpad snooze',
    features: {
      platforms: 'yes',
      free_oss: 'partial',      // public repos work free, but Launchpad snooze is paid-only and private repos require Pro
      inbox: 'partial',          // Launchpad lists cross-repo PRs/issues/WIPs — not the GitHub Notifications API surface
      pr_review: 'partial',      // help docs still send users to gitkraken.dev for Approve / Request changes
      pr_commitwise: 'no',
      issues: 'partial',         // public-repo issues work on Community; private-repo issues require Pro
      projects: 'no',
      discussions: 'no',
      actions: 'no',             // Actions panel was removed in v11.10; now strictly YAML editing in .github/workflows/
      search: 'partial'          // search is scoped to Launchpad filters + Workspace contents, not full cross-repo GitHub search
    },
    note: "Launchpad is a slick cross-provider feed — but it's not the GitHub Notifications inbox. Full PR review still redirects to GitKraken's separate web product. Actions support is now only YAML editing — no run dashboard."
  },
  {
    key: 'octopunk',
    name: 'OctoPunk',
    tagline: 'A real GitHub client for the desktop.',
    url: '/',
    pricing: 'Free for public repos · paid for private',
    isUs: true,
    features: {
      platforms: 'yes',
      free_oss: 'yes',
      inbox: 'yes',
      pr_review: 'yes',
      pr_commitwise: 'yes',
      issues: 'yes',
      projects: 'yes',
      discussions: 'yes',
      actions: 'yes',
      search: 'yes'
    },
    note: 'Notifications you can actually triage. PR review you can actually finish. Projects, Discussions, Actions — all in one window, all keyboard-driven.'
  }
];

