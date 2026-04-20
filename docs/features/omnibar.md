---
title: Omnibar and command palette
order: 1
---

# Omnibar

The omnibar makes searching for GitHub repos, issues, and pull requests blazing
fast.

Users of modern IDEs have come to love quickly callable fuzzy searching modals.
These modals can be invoked anywhere in the app at any time.

The omnibar reimagines this UI for navigating the GitHub platform.

<video src="/screens/octopunk-omnibar-path.mp4" controls width="100%" loop muted></video>

The omnibar has three modes: `path`, `repos`, and `owners`, and can be opened, by
default, with the `<meta>+o` (`<cmd> for macOS`) key sequence.

While `repos` and `owners` modes boil down to a simple text search for the respective
resources, the `path` mode is the most interesting.

In `path` mode the Omnibar will iteratively auto-complete a search for org, repo,
and issue/pr.

When you begin typing you are searching for an organization. An auto-complete
menu will be shown. Hitting `<enter>` or `/` will complete the first suggested
item, finalizing the organization search portion of the iterative completion.

If you were to hit `<enter>` with only the organization completed, the associated
organization page will open.

This same process holds true for the repository field, hitting enter with
a completed repository will open the associated repository page.

If you do not hit enter, the final string values in the searcher will search
the given repository's issues and pull requests.

This becomes a very useful way to quickly search for categories of issues
or pull requests in a repository from anywhere in Octopunk.

# Command palette

The command palette is another modern IDE feature reimagined in Octopunk.

By pressing, by default, `<meta>+p` the command palette is opened.

This modal allows the fuzzy search of available commands and is context-aware.

<video src="/screens/octopunk-command-palette.mp4" controls width="100%" loop muted></video>

The modal will display commands relative to the active tab. For example, commands
for interacting with pull requests will show when the active tab is a PR, and
commands for interacting with issues will show when the active tab is an issue.
