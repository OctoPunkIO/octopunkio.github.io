---
title: Repositories
order: 1
---

# Repositories

Octopunk provides a familiar but enhanced code repository view.

Navigating a repository should feel closer to navigating code in your favorite
editor.

## Code viewing and navigation

The `code` tab of the repository page focuses on the efficient navigation of
code and commits.

<video src="/screens/octopunk-repo-code.mp4" controls width="100%" loop muted></video>

The primary menu bar allows you to search branches and tags, files, commits,
recently visited files, and toggle the diff comparison tool. All of these
have a [command palette](/docs/features/omnibar#command-palette) command as well.

Beneath the primary menu bar is the repository commit panel. This panel will
display the HEAD commit of the checked out branch or tag. This panel ensures
you never get lost while navigating through your code. It can display the
pull request which introduced this commit (if available), the changed files
in the commit, the commit message, parent commit, and the associated branch or
tag if one exists.

Below this is the file explorer that displays the file contents of the repository.
Clicking on a file will open a file viewer. When the file viewer is presented
a smaller file tree is shown on the left and the file viewer is displayed
in the middle.

The file viewer embeds a breadcrumb navigation supporting efficient browsing
of files relative to the viewed one. The file viewer can also be changed to `blame`
mode to view the changes of lines in a file over time.

Below the file viewer's primary header is a per-file commit panel. This panel
is the same as the one we previously mentioned but reflects the last commit that
made a change to the file.

## Compare

Octopunk has a powerful diff comparison tool that supports branches, commits, tags,
and per-file comparisons.

<video src="/screens/octopunk-repo-compare.mp4" controls width="100%" loop muted></video>

The compare tool can be toggled by clicking the compare button in the primary
menu or with a [command palette](/docs/features/omnibar#command-palette) command.

## Actions

Octopunk fully supports displaying, searching, and interacting with GitHub actions.

<video src="/screens/octopunk-repo-actions.mp4" controls width="100%" loop muted></video>

A big complaint individuals have with GitHub is the difficulty finding and
organizing GitHub actions. To remedy this Octopunk consistently groups
GitHub actions by Workflows, contrasting GitHub's switch between
Checks and Workflows.

In Octopunk's [pull request](/docs/features/issues_and_pulls) page, GitHub Action
results are shown by their summary Workflow state. Therefore, if all checks in a
workflow pass, the workflow in the page is marked successful.

Similarly, in the repository's actions page we group and search on workflows.
By clicking on a workflow, a list of runs will be presented.  Each run will
show a graph of tasks within the run.

Unfortunately, due to GitHub API limitations, Octopunk can only display task
states after the workflow has been completed.

The run pages can be used to restart failed jobs.

## Projects

Octopunk supports a limited feature set of GitHub projects. Most features required
for the daily usage of projects are supported. However, advanced configurations
may not be available due to GitHub API limitations.

Currently, only the table and board views are supported.

<video src="/screens/octopunk-repo-projects.mp4" controls width="100%" loop muted></video>
